export default {
  preset: "@shelf/jest-mongodb",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./setupTests.js"],
  transform: { "^.+\\.[tj]sx?$": "babel-jest" },
};
