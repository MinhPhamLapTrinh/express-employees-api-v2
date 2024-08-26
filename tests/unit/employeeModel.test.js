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

  test("should clock in an employee", async () => {
    const uniqueNum = "0009";
    const hashedUniqueNum = await bcrypt.hash(uniqueNum, 10);
    const mockEmployee = new EmployeeModel({
      employeeName: "John Smith",
      uniqueNum: hashedUniqueNum,
    });

    const newEmp = await mockEmployee.save();
    const clockInMsg = await employeeModel.employeeClockIn(newEmp._id);
    expect(clockInMsg).toContain("John Smith clocked in on");

    const timeRecordChecked = await EmployeeModel.findById(newEmp._id);
    expect(timeRecordChecked.timeRecord.length).toBe(1);
  });

  test("should prevent clocking out if not clocked in", async () => {
    const uniqueNum = "0009";
    const hashedUniqueNum = await bcrypt.hash(uniqueNum, 10);
    const mockEmployee = new EmployeeModel({
      employeeName: "John Smith",
      uniqueNum: hashedUniqueNum,
    });

    const newEmp = await mockEmployee.save();
    await expect(employeeModel.employeeClockOut(newEmp._id)).rejects.toEqual(
      "Please, Clock-in for your first day of work!"
    );
  });

  test("should clock out an employee", async() => {
    const uniqueNum = "0009";
    const hashedUniqueNum = await bcrypt.hash(uniqueNum, 10);
    const mockEmployee = new EmployeeModel({
      employeeName: "John Smith",
      uniqueNum: hashedUniqueNum,
    });

    const newEmp = await mockEmployee.save();
    await employeeModel.employeeClockIn(newEmp._id);
    const clockOutMsg = await employeeModel.employeeClockOut(newEmp._id)
    expect(clockOutMsg).toContain("Clock out: ")
    const timeRecordChecked = await EmployeeModel.findById(newEmp._id);
    expect(timeRecordChecked.timeRecord[0].endTime).not.toBeNull();
  })
});
