// tests/unit/ownerModel.test.js

import Owner from "../../src/model/owner.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Import the connect function to initialize the DB
import { connect, OwnerModel } from "../../src/database.js";

describe("Owner Model", () => {
  let ownerModel;

  beforeAll(async () => {
    // Ensure the database is connected before running tests
    // This uses the in-memory MongoDB server
    await connect();
    ownerModel = new Owner();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await OwnerModel.deleteMany({});
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await mongoose.disconnect();
  });

  test("should verify owner in the system", async () => {
    const ownerName = "John Smith";
    const hashPassword = await bcrypt.hash("1234", 10);
    const newOwner = new OwnerModel({
      username: ownerName,
      password: hashPassword,
    });

    const savedOwner = await newOwner.save();
    const verifiedOwner = await ownerModel.verifyOwner({
      username: savedOwner.username,
      password: "1234",
    });
    expect(verifiedOwner.username).toBe("John Smith");
  });

  test("should return the rejection message for incorrect password!", async () => {
    const ownerName = "John Smith";
    const hashPassword = await bcrypt.hash("1234", 10);
    const newOwner = new OwnerModel({
      username: ownerName,
      password: hashPassword,
    });

    const savedOwner = await newOwner.save();
    await expect(
      ownerModel.verifyOwner({
        username: savedOwner.username,
        password: "1222",
      })
    ).rejects.toEqual("Incorrect password for John Smith");
  });

  test("should not verify for incorrect username and password!", async () => {
    const ownerName = "John Smith";
    const hashPassword = await bcrypt.hash("1234", 10);
    const newOwner = new OwnerModel({
      username: ownerName,
      password: hashPassword,
    });

    await newOwner.save();
    await expect(
      ownerModel.verifyOwner({
        username: "John Doe",
        password: "1222",
      })
    ).rejects.toEqual("Unable to find John Doe");
  });
});
