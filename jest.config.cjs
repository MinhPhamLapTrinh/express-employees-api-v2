// Get the full path to our env.jest file
const path = require("path");
const envFile = path.join(__dirname, ".env.test");

// Read the environment variables we use for Jest from our env.jest file
require("dotenv").config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.log(
  `Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.test for more detail`
);

// jest.config.js
module.exports = {
  preset: "@shelf/jest-mongodb",
  testEnvironment: "node",
  globalSetup: "./jestGlobalSetup.js",
  globalTeardown: "./jestGlobalTeardown.js",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!your-esm-package)", // Replace 'your-esm-package' with the actual package name if needed
  ],
  maxWorkers: "50%",
  testTimeout: 5000,
};
