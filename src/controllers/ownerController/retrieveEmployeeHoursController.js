// src/controllers/ownerController/retrieveEmployeeHoursController.js

import logger from "../../logger.js";
import Owner from "../../model/owner.js";

const ownerModel = new Owner();

// Retrieve the list of employees corresponding with the start date and end date
const retrieveEmployeeHours = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Logs the start date and end date.
  logger.debug({ startDate }, "Start date: ");
  logger.debug({ endDate }, "End date: ");

  await ownerModel
    .getAllEmployeeByDate(new Date(startDate), new Date(endDate))
    .then((empList) => {
      res.status(200).json({
        status: "ok",
        employees: empList,
      });
    })
    .catch((err) => {
      logger.error({ err });
      res.status(500).send({ message: err });
    });
};

export default retrieveEmployeeHours;
