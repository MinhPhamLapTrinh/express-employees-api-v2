// src/controllers/ownerController/updateEmpHoursController.js

import logger from "../../logger.js";
import Owner from "../../model/owner.js";

const ownerModel = new Owner();

const updateEmpHours = async (req, res) => {
  // Logs information
  logger.info("Updating an existing employee's record!!");
  logger.info("Recieved Body: ", req.body);

  // Employee's id
  const id = req.params.id;
  /**
   * Destructures the request body to extract the necessary fields.
   *
   * @typedef {Object} RequestBody
   * @property {string} time - The updated time associated with the employee's time record.
   * @property {string} field - Start date or End Date.
   * @property {string} recordID - The unique identifier for the time record.
   * @property {number} totalHours - The new total hours worked by the employee.
   *
   * @type {RequestBody}
   */
  const { time, field, recordID, totalHours } = req.body;

  await ownerModel
    .updateEmployeeTime(id, time, field, recordID, totalHours)
    .then((newTime) => {
      logger.debug({ newTime }, "Updated Time: ");
      res.status(201).json({
        status: "ok",
        timeRecord: newTime,
      });
    })
    .catch((err) => {
      logger.error({ err });
      res.status(500).send({ message: err });
    });
};

export default updateEmpHours;
