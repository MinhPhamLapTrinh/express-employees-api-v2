// src/routes/api/getEmpList.js

import logger from "../../logger";

const retrieveListEmployees = async (req, res) => {
  logger.info(`Processing GET employee list!!`);
  res.status(200).json({
    status: "ok",
    employees: [],
  });
};

export default retrieveListEmployees;
