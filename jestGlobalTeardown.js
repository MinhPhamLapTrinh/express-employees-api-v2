// jestGlobalTeardown.js
import { MongoMemoryServer } from "mongodb-memory-server";

const globalTeardown = async () => {
  if (globalThis.__MONGO_URI__) {
    const mongoServer = await MongoMemoryServer.create();
    await mongoServer.stop();
  }
};

export default globalTeardown;
