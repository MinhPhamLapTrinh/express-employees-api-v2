// src/controllers/ownerController/addEmployeeController.js

import logger from "../../logger.js";
import Owner from "../../model/owner.js";

const ownerModel = new Owner();

// Add new employee
const addNewEmployee = (req, res) => {
  // Log the received request body to debug
  logger.debug("Request body:", req.body);

  logger.info("Add new employee");
  ownerModel
    .addEmployee(req.body.name, req.body.uniqueNum)
    .then((msg) => {
      res.status(201).json({ status: "ok", message: msg });
    })
    .catch((err) => {
      logger.error({ err });
      res.status(500).send({ message: err });
    });
};

export default addNewEmployee;
