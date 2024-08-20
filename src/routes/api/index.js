// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the employees API
 *
 */

import express from "express";
import passport from "../../auth.js";

import retrieveListEmployees from "../../controllers/getEmpList.js";
// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/employees
router.get(
  "/employees/empList",
  passport.authenticate("jwt", { session: false }),
  retrieveListEmployees
);

export default router;
