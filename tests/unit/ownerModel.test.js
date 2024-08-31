// tests/unit/ownerModel.test.js

import Owner from "../../src/model/owner.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// Import the connect function to initialize the DB
import { connect, OwnerModel, EmployeeModel } from "../../src/database.js";

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
    await EmployeeModel.deleteMany({});
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

  test("should add a new employee", async () => {
    const name = "Alice";
    const uniqueNum = "123456";
    const result = await ownerModel.addEmployee(name, uniqueNum);
    expect(result).toBe("Employee Alice successfully added");
  });

  test("should retrieve a list of existing employees", async () => {
    const employees = [
      { employeeName: "Alice", uniqueNum: "123456" },
      { employeeName: "Bob", uniqueNum: "789012" },
    ];

    // Wait for all the addEmployee operations complete before proceeding. It is the promise concurrency methods.
    await Promise.all(
      employees.map((employee) =>
        ownerModel.addEmployee(employee.employeeName, employee.uniqueNum)
      )
    );

    /**
     * @matcher expect.arrayContaining(array) matches a received array which contains all of the elements in the expected array
     * @matcher expect.objectContaining(object) matches any received object that recursively matches the expected properties
     * @matcher expect.any(constructor) matches anything that was created with the given constructor or if it's a primitive that is of the passed type.
     */
    const result = await ownerModel.getAllEmployee();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeName: "Alice",
          uniqueNum: expect.any(String),
        }),
        expect.objectContaining({
          employeeName: "Bob",
          uniqueNum: expect.any(String),
        }),
      ])
    );
  });

  test("should retrieve a list of existing employees within the range date", async () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");
    const result = await ownerModel.getAllEmployeeByDate(startDate, endDate);
    expect(result).toEqual(expect.any(Array));
  });

  test("should update employee's working hours", async () => {
    // Sample Employee's Information
    const uniqueNum = "0009";
    const hashedUniqueNum = await bcrypt.hash(uniqueNum, 10);
    const mockEmployee = new EmployeeModel({
      employeeName: "John Smith",
      uniqueNum: hashedUniqueNum,
      timeRecord: [
        {
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          totalWorkingHours: 0,
        },
      ],
    });
    const newEmp = await mockEmployee.save();

    const empID = newEmp._id;

    const time = new Date();
    const field = "startTime";
    const recordID = newEmp.timeRecord[0]["_id"];
    const totalHours = 8;

    const result = await ownerModel.updateEmployeeTime(
      empID,
      time,
      field,
      recordID,
      totalHours
    );

    expect(result).toEqual(expect.any(Array));
  });

  test("should remove an employee", async () => {
    const employee = await ownerModel.addEmployee("Alice", "123456");
    const result = await ownerModel.removeEmployee(employee._id);
    expect(result).toEqual(expect.any(Object));
  });
});
