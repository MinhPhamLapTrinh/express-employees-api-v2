// src/controllers/employeeControllers/employeeClockInController.js

import logger from "../../logger.js";
import Employee from "../../model/employee.js";

const employeeModel = new Employee();

// Handle the process of clocking-in for employees
const employeeClockIn = async (req, res) => {
  // Employee's unique number
  const uniqueNum = req.body.uniqueNum;
  try {
    // Verify an employee
    const result = await employeeModel.verifyEmployee(uniqueNum);
    const empID = result._id;
    logger.debug({ empID }, "Employee's ID: ");

    // Authorized Employee will be able to clock-in
    try {
      const msg = await employeeModel.employeeClockIn(empID);
      res.status(201).json({
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

export default employeeClockIn;
