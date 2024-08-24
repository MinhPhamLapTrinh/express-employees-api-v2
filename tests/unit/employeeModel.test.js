// tests/unit/employee.test.js
import Employee from "../../src/model/employee.js";
import bcrypt from "bcrypt";
import { connect, EmployeeModel } from "../../src/database.js"; // Import the connect function to initialize the DB
import mongoose from "mongoose";

describe("Employee Model", () => {
  let employeeModel;

  beforeAll(async () => {
    // Ensure the database is connected before running tests
    await connect(); // This uses the in-memory MongoDB connection during tests

    employeeModel = new Employee();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await EmployeeModel.deleteMany({});
  });

  afterAll(async () => {
    // Close the database connection after all tests are done
    await mongoose.disconnect();
  });

  test("should verify an employee by their unique number", async () => {
    const uniqueNum = "12345";
    const hashedUniqueNum = await bcrypt.hash(uniqueNum, 10);
    const mockEmployee = new EmployeeModel({
      employeeName: "John Doe",
      uniqueNum: hashedUniqueNum,
    });

    await mockEmployee.save();

    const verifiedEmployee = await employeeModel.verifyEmployee(uniqueNum);
    expect(verifiedEmployee.employeeName).toBe("John Doe");
  });
});
