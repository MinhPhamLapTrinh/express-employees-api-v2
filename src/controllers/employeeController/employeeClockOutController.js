// src/controllers/employeeControllers/employeeClockInController.js

import logger from "../../logger.js";
import Employee from "../../model/employee.js";

const employeeModel = new Employee();

// Handle the process of clocking-out for an employee.
const employeeClockOut = async (req, res) => {
  // Employee's unique number
  const uniqueNum = req.params.uniqueNum;
  try {
    // Verify an employee
    const result = await employeeModel.verifyEmployee(uniqueNum);
    const empID = result._id;
    logger.debug({ empID }, "Employee's ID: ");

    // Authorized Employee will be able to clock-out
    try {
      const msg = await employeeModel.employeeClockOut(empID);
      res.status(200).json({
        status: "ok",
        message: msg,
      });
    } catch (err) {
      logger.error({ err });
      res.status(500).send({ message: err });
    }
  } catch (err) {
    logger.error({ err });
    res.status(500).send({ message: err.message });
  }
};

export default employeeClockOut;
