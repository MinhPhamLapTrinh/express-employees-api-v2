// src/controllers/employeeController/getDetailInfo.js

import logger from "../../logger.js";
import Employee from "../../model/employee.js";

const employeeModel = new Employee();

// Retrieve the detailed working hours record based on the given unique number
const getPersonalDetail = async (req, res) => {
  logger.info("Processing Personal Detail");
  const uniqueNum = req.params.uniqueNum;

  await employeeModel
    .verifyEmployee(uniqueNum)
    .then((emp) => {
      logger.debug(emp.employeeName);
      res.status(200).json(emp);
    })
    .catch((err) => {
      logger.error({ err });
      res.status(401).send({ message: err.message });
    });
};

export default getPersonalDetail;
