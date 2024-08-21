import mongoose from "mongoose";
import env from "dotenv";
env.config();

let mongoDBConnectionString = process.env.MONGO_URI;

let Schema = mongoose.Schema;

let timeRecordSchema = new Schema({
  date: Date,
  startTime: Date,
  endTime: Date,
  totalWorkingHours: Number,
});

let employeeSchema = new Schema({
  employeeName: String,
  uniqueNum: String,
  timeRecord: [timeRecordSchema],
});

let ownerSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
});

let OwnerModel;
let EmployeeModel;

export function connect() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(mongoDBConnectionString);

    db.on("error", (err) => {
      reject(err);
    });

    db.once("open", () => {
      EmployeeModel = db.model("Employee", employeeSchema);
      OwnerModel = db.model("Owner", ownerSchema);
      resolve();
    });
  });
}

export { OwnerModel, EmployeeModel };
