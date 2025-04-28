// src/models/employee.js
import { EmployeeModel } from "../database.js";
import bcrypt from "bcrypt";
import logger from "../logger.js";

class Employee {
  constructor() {
    this.Employee = EmployeeModel;
  }

  /**
   * Verify an employee by the given unique number
   * @param {string} uniqueNum employee's unique number to clock-in or clock-out
   * @returns Promise<an employee whose unique number matches the given unique number>
   */
  async verifyEmployee(uniqueNum) {
    try {
      const employees = await EmployeeModel.find({}).exec();
      for (const emp of employees) {
        if (await bcrypt.compare(uniqueNum, emp.uniqueNum)) {
          return emp;
        }
      }
      throw new Error("Invalid PIN");
    } catch (err) {
      throw new Error("Unable to find you in the system: " + err);
    }
  }

  /**
   * Handle the process of employee clock-in
   * @param {string} id employee's id which is created in the MongoDB
   * @returns Promise<a message showing the time that employee clock-in>
   */
  employeeClockIn(id) {
    return new Promise(function (resolve, reject) {
      EmployeeModel.findById(id)
        .exec()
        .then((emp) => {
          // Current time in local timezone
          const now = new Date();

          // Start of today in local timezone (GMT-4)
          const today = new Date(now.getTime());
          today.setHours(0, 0, 0, 0);
          logger.debug({ today }, "Today Time: ");

          const latestRecord = emp.timeRecord[emp.timeRecord.length - 1];

          // Check if employee already clocked-in for today
          if (latestRecord) {
            const latestRecordDate = new Date(latestRecord.startTime);
            // Convert to local timezone
            const latestRecordDateLocal = new Date(latestRecordDate.getTime());
            logger.debug(
              { latestRecordDateLocal },
              "Latest Record for Today: "
            );
            // Compare the latest time record to today
            if (
              latestRecordDateLocal.getFullYear() === today.getFullYear() &&
              latestRecordDateLocal.getMonth() === today.getMonth() &&
              latestRecordDateLocal.getDate() === today.getDate()
            ) {
              reject(`You ALREADY clocked in today!!!`);
              return;
            }
          }

          // Save today record into MongoDB
          const startTime = now;
          emp.timeRecord.push({
            date: startTime,
            startTime: startTime,
            endTime: null,
            totalWorkingHours: 0,
          });
          emp
            .save()
            .then(() => {
              resolve(emp.timeRecord[emp.timeRecord.length - 1].startTime);
            })
            .catch((err) => {
              reject(`Cannot clock in ` + err);
            });
        });
    });
  }

  /**
   * Handle the process of employee clock-out
   * @param {string} id employee's id which is created in the MongoDB
   * @returns Promise<a message showing the time that employee clock-out>
   */
  employeeClockOut(id) {
    return new Promise(function (resolve, reject) {
      EmployeeModel.findById(id)
        .exec()
        .then((emp) => {
          // Current time in local timezone
          const now = new Date("2025-04-29T02:43:09.150Z");
          logger.debug({ now }, "Time now: ");

          // Start of today in local timezone
          const today = new Date(now.getTime());
          today.setHours(0, 0, 0, 0);

          const timeRecord = emp.timeRecord[emp.timeRecord.length - 1];

          // New employee who has no record yet trying to clock-out
          if (!timeRecord) {
            reject("Please, Clock-in for your first day of work!");
            return;
          }

          const start = new Date(timeRecord.startTime);

          const clockInTime = new Date(start.getTime());
          clockInTime.setHours(0, 0, 0, 0);
          logger.debug({ clockInTime }, "Latest Clock In time: ");
          logger.debug({ today }, "Time for today: ");
          const clockTime = clockInTime.getTime();
          const todayTime = today.getTime();

          logger.debug({ clockTime }, "Latest Clock In time: ");
          logger.debug({ todayTime }, "Time for today: ");

          // Employees are not allowed to clock-out unless they've clocked in for today
          if (clockInTime.getTime() !== today.getTime()) {
            reject("You have to clock in first!");
          } else {
            const endTime = now;
            const start = new Date(timeRecord.startTime).getTime();
            const end = endTime.getTime();
            const totalWorkingHours = (end - start) / (1000 * 60 * 60);
            const totalHours = Math.floor(totalWorkingHours);
            const totalMinutes = Math.floor(
              (totalWorkingHours - totalHours) * 60
            );

            // Set up the end time and calculate the total working hours for current date
            EmployeeModel.updateOne(
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
                resolve({
                  endTime: endTime,
                  totalHours: totalHours,
                  totalMinutes: totalMinutes,
                });
              })
              .catch((err) => {
                reject(`Cannot clock out due to ${err}`);
              });
          }
        });
    });
  }
}

export default Employee;
