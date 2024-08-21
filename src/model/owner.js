// src/model/owner.js

// Get our Owner and Employee Schema in MongoDB
import { OwnerModel, EmployeeModel } from "../database.js";

// A library to help us hash passwords
import bcrypt from "bcrypt";

// Get our environment variables.
import env from "dotenv";

env.config();

// Cost factor controls how much time is needed for Bcrypt hash
const saltRounds = parseInt(process.env.SALT_ROUNDS);

// GMT -4
const LOCAL_GMT = 4;

class Owner {
  constructor() {
    this.Owner = OwnerModel;
  }

  /**
   * Verify an owner by the given username and password
   * @param {object} ownerData An object of owner from user-input
   * @returns Promise<an authorized owner>
   */
  verifyOwner(ownerData) {
    return new Promise(function (resolve, reject) {
      OwnerModel.findOne({ username: ownerData.username })
        .exec()
        .then((owner) => {
          // Hash the given password and compare with the existing one in the database
          bcrypt.compare(ownerData.password, owner.password).then((res) => {
            if (res === true) {
              resolve(owner);
            } else {
              reject("Incorrect password for " + ownerData.username);
            }
          });
        })
        .catch(() => {
          reject("Unable to find " + ownerData.username);
        });
    });
  }

  /**
   * Store a new employee into the storage
   * @param {string} name employee name
   * @param {string} uniqueNum employee's unique number
   * @returns Promise<a message showing successfully added>
   */
  addEmployee(name, uniqueNum) {
    return new Promise(function (resolve, reject) {
      // Hash the uniqueNumber
      bcrypt.hash(uniqueNum, saltRounds, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          uniqueNum = hash;
          // Create a new employee model
          const newEmployee = new EmployeeModel({
            employeeName: name,
            uniqueNum: uniqueNum,
          });

          // Store the new employee in MongoDB
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

  /**
   * Retrieve a list of existing employee from the database
   * @returns Promise<a list of employee>
   */
  getAllEmployee() {
    return new Promise((resolve, reject) => {
      EmployeeModel.find()
        .exec()
        .then((emp) => {
          resolve(emp);
        })
        .catch((err) => {
          reject("Error occurs: ", err);
        });
    });
  }

  /**
   * Retrieve a list of existing employee within the range date (start date - end date) to calculate salary
   * @returns Promise<a list of employee>
   */
  getAllEmployeeByDate(startDate, endDate) {
    return new Promise(function (resolve, reject) {
      // Convert the start date to the local timezone (Toronto)
      const start = new Date(startDate - LOCAL_GMT * 60 * 60 * 1000);
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);

      // Convert the end date to the local timezone (Toronto)
      const end = new Date(endDate - LOCAL_GMT * 60 * 60 * 1000);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);

      EmployeeModel.find({})
        .then((employees) => {
          // Filter out list of employee who have worked within the specific range date
          const biWeeklyWorkingHours = employees
            .map((emp) => {
              const totalHours = emp.timeRecord
                .filter(
                  (time) =>
                    new Date(time.date - LOCAL_GMT * 60 * 60 * 1000) >= start &&
                    new Date(time.date - LOCAL_GMT * 60 * 60 * 1000) <= end
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

          // A list of employee object including the total working hours and their name
          resolve(biWeeklyWorkingHours);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Modify the working hours for employee
   * @param {string} empID employee's id which is stored in MongoDB
   * @param {Date} time new time for updating the existing time
   * @param {string} field start time or end time
   * @param {string} recordID timeRecord's id which is created automatically by MongoDB
   * @param {double} totalHours new total working hours for updating the existing one.
   * @returns Promise<new timeRecord>
   */
  updateEmployeeTime(empID, time, field, recordID, totalHours) {
    return new Promise((resolve, reject) => {
      let updateRecord = {};
      updateRecord[`timeRecord.$.${field}`] = time;
      updateRecord["timeRecord.$.totalWorkingHours"] = totalHours;
      EmployeeModel.findOneAndUpdate(
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

  /**
   * Delete specific employee's record based on the given id
   * @param {string} id employee's id which is stored in MongoDB
   * @returns Promise<deleted employee>
   */
  removeEmployee(id) {
    return new Promise((resolve, reject) => {
      EmployeeModel.deleteOne({ _id: id })
        .exec()
        .then((emp) => {
          resolve(emp);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default Owner;
