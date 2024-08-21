// src/controllers/ownerController/ownerLoginController.js

import logger from "../../logger.js";
import jwt from "jsonwebtoken";
import { jwtOptions } from "../../auth.js";
import Owner from "../../model/owner.js";

// Initialize owner model
const ownerModel = new Owner();

const verifyOwner = async (req, res) => {
  await ownerModel
    .verifyOwner(req.body)
    .then((owner) => {
      logger.info(`Verified user: ${owner.username}`);

      // Set up payload
      let payload = {
        _id: owner._id,
        username: owner.username,
      };

      // Create token and pass it to client side
      let token = jwt.sign(payload, jwtOptions.secretOrKey);

      res.status(201).json({
        status: "ok",
        message: owner,
        token: token,
      });
    })
    .catch((err) => {
      logger.error({ err });
      res.status(404).json({ message: err });
    });
};

export default verifyOwner;
