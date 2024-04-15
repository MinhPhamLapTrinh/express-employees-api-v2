import mongoose from "mongoose";
import env from "dotenv";
env.config();
import bcrypt from "bcrypt";

const MORNING_SHIFT_START = 11;
const MORNING_SHIFT_END = 17;
const EVENING_SHIFT_START = 17;
const EVENING_SHIFT_END = 22;
const LATE_START_TIME = 30;

const saltRounds = parseInt(process.env.SALT_ROUNDS);
let mongoDBConnectionString = process.env.MONGO_URI;

let Schema = mongoose.Schema;

let timeRecordSchema = new Schema({
  date: Date,
  startTime: Date,
  endTime: Date,
  totalWorkingHours: Number,
});

let employeeSchema = new Schema({
  employeeName: String,
  uniqueNum: String,
  timeRecord: [timeRecordSchema],
});

let ownerSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
});

let Owner;
let Employee;

export function connect() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(mongoDBConnectionString);

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      Employee = db.model("Employee", employeeSchema);
      Owner = db.model("Owner", ownerSchema);
      resolve();
    });
  });
}

export function checkOwner(ownerData) {
  return new Promise(function (resolve, reject) {
    Owner.findOne({ username: ownerData.username })
      .exec()
      .then((owner) => {
        bcrypt
          .compare(ownerData.password, owner.password)
          .then((res) => {
            if (res === true) {
              resolve(owner);
            } else {
              reject("Incorrect password for user " + ownerData.username);
            }
          })
          .catch(() => {
            reject("Unable to find user " + ownerData.username);
          });
      });
  });
}

export function addEmployee(name, uniqueNum) {
  return new Promise(function (resolve, reject) {
    bcrypt.hash(uniqueNum, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        uniqueNum = hash;
        const newEmployee = new Employee({
          employeeName: name,
          uniqueNum: uniqueNum,
        });
        newEmployee
          .save()
          .then(() => {
            resolve(
              "Employee " + newEmployee.employeeName + " successfully added"
            );
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  });
}

export async function checkInEmployee(uniqueNum) {
  return new Promise(async function (resolve, reject) {
    try {
      const employees = await Employee.find({}).exec();
      for (const employee of employees) {
        if (await bcrypt.compare(uniqueNum, employee.uniqueNum)) {
          resolve(employee);
          return;
        }
      }
      reject("INVALID PIN");
    } catch (err) {
      reject("Unable to find you in the system");
    }
  });
}

export function getAllEmployee() {
  return new Promise((resolve, reject) => {
    Employee.find()
      .exec()
      .then((emp) => {
        resolve(emp);
      })
      .catch((err) => {
        reject("Error occurs: ", err);
      });
  });
}

export function employeeClockIn(id) {
  return new Promise(function (resolve, reject) {
    Employee.findById(id)
      .exec()
      .then((emp) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastRecord = emp.timeRecord[emp.timeRecord.length - 1];
        if (
          lastRecord &&
          new Date(lastRecord.date).setHours(0, 0, 0, 0) === today
        ) {
          reject("You already clocked in today");
        } else {
          let startTime = new Date().toLocaleString();
          let start = new Date().toLocaleString();
          let startHour = new Date().getHours();
          let startMinutes = new Date().getMinutes();
          if (
            (startHour === MORNING_SHIFT_START && startMinutes > 5) ||
            (startHour > MORNING_SHIFT_START && startHour < MORNING_SHIFT_END)
          ) {
            start = new Date(start).setMinutes(startMinutes + LATE_START_TIME);
            startTime = new Date(start).toLocaleString();
          } else if (
            (startHour === EVENING_SHIFT_START && startMinutes > 10) ||
            startHour > EVENING_SHIFT_START
          ) {
            start = new Date(start).setMinutes(startMinutes + LATE_START_TIME);
            startTime = new Date(start).toLocaleString();
          }
          emp.timeRecord.push({
            date: startTime,
            startTime: startTime,
            endTime: null,
            totalWorkingHours: 0,
          });
          emp
            .save()
            .then(() => {
              resolve(`${emp.employeeName} clocked in on ${startTime}`);
            })
            .catch((err) => {
              reject(`Cannot clock in ` + err);
            });
        }
      });
  });
}

export function employeeClockOut(id) {
  return new Promise(function (resolve, reject) {
    Employee.findById(id)
      .exec()
      .then((emp) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const timeRecord = emp.timeRecord[emp.timeRecord.length - 1];
        if (
          !timeRecord ||
          new Date(timeRecord.startTime).setHours(0, 0, 0, 0) !== today
        ) {
          reject("You have to clock in first!");
        } else if (
          lastRecord &&
          new Date(lastRecord.date).setHours(0, 0, 0, 0) === today
        ) {
          reject("You already clocked out today");
        } else {
          const endTime = new Date();
          const start = new Date(timeRecord.startTime).getTime();
          const end = endTime.getTime();
          const totalWorkingHours = (end - start) / (1000 * 60 * 60);
          const totalHours = Math.floor(totalWorkingHours);
          const totalMinutes = Math.floor(
            (totalWorkingHours - totalHours) * 60
          );
          Employee.updateOne(
            {
              _id: id,
              "timeRecord._id": timeRecord._id,
            },
            {
              $set: {
                "timeRecord.$.endTime": endTime,
                "timeRecord.$.totalWorkingHours": totalWorkingHours,
              },
            }
          )
            .then(() => {
              resolve(
                `Clock out: ${new Date(endTime).toLocaleTimeString()}.
                 Time: ${totalHours} hours and ${totalMinutes} minutes.`
              );
            })
            .catch((err) => {
              reject(`Cannot clock out due to ${err}`);
            });
        }
      });
  });
}

export function getAllEmployeeByDate(startDate, endDate) {
  return new Promise(function (resolve, reject) {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999);
    Employee.find({})
      .then((employees) => {
        const biWeeklyWorkingHours = employees
          .map((emp) => {
            const totalHours = emp.timeRecord
              .filter(
                (time) =>
                  new Date(time.date) >= start && new Date(time.date) <= end
              )
              .map((filterDate) => filterDate.totalWorkingHours);
            return totalHours.length > 0
              ? {
                  name: emp.employeeName,
                  time: totalHours.reduce(
                    (accumulator, currentValue) => accumulator + currentValue
                  ),
                }
              : null;
          })
          .filter(Boolean);
        resolve(biWeeklyWorkingHours);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function updateEmployeeTime(empID, time, field, recordID, totalHours) {
  return new Promise((resolve, reject) => {
    let updateRecord = {};
    updateRecord[`timeRecord.$.${field}`] = time;
    updateRecord["timeRecord.$.totalWorkingHours"] = totalHours;
    Employee.findOneAndUpdate(
      {
        _id: empID,
        "timeRecord._id": recordID,
      },
      {
        $set: updateRecord,
      },
      { new: true }
    )
      .exec()
      .then((emp) => {
        resolve(emp.timeRecord);
      })
      .catch((err) => {
        reject("Error: " + err.message);
      });
  });
}

export function removeEmployee(id) {
  return new Promise((resolve, reject) => {
    Employee.deleteOne({ _id: id })
      .exec()
      .then((emp) => {
        resolve(emp);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
