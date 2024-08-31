// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the employees API
 *
 */

import express from "express";
import passport from "../../auth.js";

import retrieveListEmployees from "../../controllers/ownerController/getEmpListController.js";
import verifyOwner from "../../controllers/ownerController/ownerLoginController.js";
import getPersonalDetail from "../../controllers/employeeController/getDetailInfoController.js";
import addNewEmployee from "../../controllers/ownerController/addEmployeeController.js";
import deleteEmployee from "../../controllers/ownerController/deleteEmployeeController.js";
import retrieveEmployeeHours from "../../controllers/ownerController/retrieveEmployeeHoursController.js";
import updateEmpHours from "../../controllers/ownerController/updateEmpHoursController.js";
import employeeClockIn from "../../controllers/employeeController/employeeClockInController.js";
import employeeClockOut from "../../controllers/employeeController/employeeClockOutController.js";
// Create a router on which to mount our API endpoints
const router = express.Router();

/**
 * Define our first route, which will be: GET /v1/employees
 * Authorized owner will be able to retrieve a list of employees
 */
router.get(
  "/sglotus/empList",
  passport.authenticate(["jwt", "basic"], { session: false }),
  retrieveListEmployees
);

// Sign in route for only owners. EMPLOYEE NOT ALLOWED
router.post("/sglotus/ownerLogin", verifyOwner);

// Add employee route for only owners.
router.post(
  "/sglotus/newEmployee",
  passport.authenticate(["jwt", "basic"], { session: false }),
  addNewEmployee
);

// Remove an employee route for only owners.
router.delete(
  "/sglotus/delete/:id",
  passport.authenticate(["jwt", "basic"], { session: false }),
  deleteEmployee
);

// Retrieve a list of employees based on the given range date.
router.get(
  "/sglotus/employeeHours",
  passport.authenticate(["jwt", "basic"], { session: false }),
  retrieveEmployeeHours
);

// Update the start date or end date of the particular employee
router.put(
  "/sglotus/updateEmployeeHours/:id",
  passport.authenticate(["jwt", "basic"], { session: false }),
  updateEmpHours
);

// A route for employees to check their time working records
router.get("/sglotus/personalDetail/:uniqueNum", getPersonalDetail);

// A route for employees to clock-in with the system
router.post(
  "/sglotus/clockIn/:uniqueNum",
  passport.authenticate(["jwt", "basic"], { session: false }),
  employeeClockIn
);

// A route for employees to clock-out with the system
router.post(
  "/sglotus/clockOut/:uniqueNum",
  passport.authenticate(["jwt", "basic"], { session: false }),
  employeeClockOut
);

export default router;
