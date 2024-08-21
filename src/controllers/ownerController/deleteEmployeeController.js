// src/controllers/ownerController/deleteEmployeeController.js

import logger from "../../logger.js";
import Owner from "../../model/owner.js";

const ownerModel = new Owner();

// Remove an employee from the storage permanently
const deleteEmployee = async (req, res) => {
  logger.info("Deleting an employee!!");
  const id = req.params.id;
  await ownerModel
    .removeEmployee(id)
    .then((emp) => {
      res.status(200).json({
        status: "ok",
        employee: emp,
      });
    })
    .catch((err) => {
      logger.error({ err });
      res.status(500).json({ error: err });
    });
};

export default deleteEmployee;
