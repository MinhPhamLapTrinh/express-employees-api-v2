// src/routes/api/getEmpList.js

import logger from "../logger.js";

const retrieveListEmployees = async (req, res) => {
  logger.info(`Processing GET employee list!!`);
  res.status(200).json({
    status: "ok",
    employees: [],
  });
};

export default retrieveListEmployees;
