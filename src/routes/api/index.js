// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the employees API
 *
 */

import express from "express";
import passport from "../../auth.js";

import retrieveListEmployees from "../../controllers/ownerController/getEmpListController.js";
import verifyOwner from "../../controllers/ownerController/ownerLoginController.js";
import getPersonalDetail from "../../controllers/employeeController/getDetailInfo.js";
// Create a router on which to mount our API endpoints
const router = express.Router();

/**
 * Define our first route, which will be: GET /v1/employees
 * Authorized owner will be able to retrieve a list of employees
 */
router.get(
  "/employees/empList",
  passport.authenticate("jwt", { session: false }),
  retrieveListEmployees
);

// Sign in route for only owners. EMPLOYEE NOT ALLOWED
router.post("/employees/ownerLogin", verifyOwner);

// A route for employees to check their time working records
router.get("/employees/personalDetail/:uniqueNum", getPersonalDetail);
export default router;
