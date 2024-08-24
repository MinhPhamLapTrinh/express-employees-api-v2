// // jestGlobalSetup.js
// jestGlobalSetup.js
import { MongoMemoryServer } from "mongodb-memory-server";

const globalSetup = async () => {
  const mongoServer = await MongoMemoryServer.create();
  globalThis.__MONGO_URI__ = mongoServer.getUri();
  globalThis.__MONGO_DB_NAME__ = mongoServer.instanceInfo.dbName;
};

export default globalSetup;
