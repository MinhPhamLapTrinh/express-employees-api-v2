// tests/unit/getEmpListController.test.js

import request from "supertest";
import bcrypt from "bcrypt";
import app from "../../src/app.js";

import mongoose from "mongoose";

// Import the connect function to initialize the DB
import { connect, EmployeeModel, OwnerModel } from "../../src/database.js";

import Owner from "../../src/model/owner.js";

const ownerModel = new Owner();
beforeAll(async () => {
  // Ensure the database is connected before running tests
  // This uses the in-memory MongoDB server
  try {
    await connect();

    // Sample Owner for testing
    const hashedPassword = await bcrypt.hash("1234", 10);
    const newOwner = new OwnerModel({
      username: "JohnSmith",
      password: hashedPassword,
    });

    await newOwner.save();
  } catch (err) {
    console.error("Error setting up test owner: ", err);
  }
});

afterAll(async () => {
  // Close the database connection after all tests
  await EmployeeModel.deleteMany({});
  await OwnerModel.deleteMany({});
  await mongoose.disconnect();
});

describe("GET /v1/sglotus/empList", () => {
  test("should deny for unauthenticated requests", () =>
    request(app).get("/v1/sglotus/empList").expect(401));

  test("authenticated users request employees list", async () => {
    await request(app)
      .get("/v1/sglotus/empList")
      .auth("JohnSmith", "1234")
      .expect(200);
  });

  test("authenticated users get a employees list (empty array)", async () => {
    const res = await request(app)
      .get("/v1/sglotus/empList")
      .auth("JohnSmith", "1234");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(Array.isArray(res.body.employees)).toBe(true);
  });

  test("should return employee list with status 200", async () => {
    const mockEmpList = [
      { employeeName: "John Doe", uniqueNum: "1233" },
      { employeeName: "Mary Jane", uniqueNum: "2333" },
    ];

    await Promise.all(
      mockEmpList.map((emp) =>
        ownerModel.addEmployee(emp.employeeName, emp.uniqueNum)
      )
    );

    const res = await request(app)
      .get("/v1/sglotus/empList")
      .auth("JohnSmith", "1234");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.employees).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeName: "John Doe",
          uniqueNum: expect.any(String),
        }),
        expect.objectContaining({
          employeeName: "Mary Jane",
          uniqueNum: expect.any(String),
        }),
      ])
    );
  });
});
