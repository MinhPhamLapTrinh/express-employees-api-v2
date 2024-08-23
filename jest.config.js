import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the full path to our env.jest file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFile = path.join(__dirname, ".env.test");

// Read the environment variables we use for Jest from our env.jest file
dotenv.config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.log(
  `Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`
);

export default {
  preset: "@shelf/jest-mongodb",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./setupTests.js"],
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },
  maxWorkers: "50%",
  testTimeout: 5000,
};
