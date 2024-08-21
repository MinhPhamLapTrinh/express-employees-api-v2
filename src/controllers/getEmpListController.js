// src/controllers/getEmpListController.js

import logger from "../logger.js";
import Owner from "../model/owner.js";

const ownerModel = new Owner();

const retrieveListEmployees = async (req, res) => {
  logger.info(`Processing GET employee list!!`);
  await ownerModel
    .getAllEmployee()
    .then((empList) => {
      res.status(200).json({
        status: "ok",
        employees: empList,
      });
    })
    .catch((err) => {
      res.status(422).json({ message: err });
    });
};

export default retrieveListEmployees;
