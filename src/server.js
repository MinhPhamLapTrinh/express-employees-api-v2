// src/server.js

// We want to gracefully shutdown our server
// https://www.npmjs.com/package/stoppable
import stoppable from "stoppable";

// Get our logger instance
import logger from "./logger.js";

// Get our express app instance
import app from "./app.js";

// Get the desired port from the process' environment. Default to `8080`
import port from "./config/index.js";

// Connect to the database
import { connect } from "./database.js";

async function connectDbs() {
  try {
    await connect();
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error({ err }, "Fail to connect to the database");
    process.exit(1);
  }
}

// Start connecting to Database
connectDbs();

// Start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    logger.info(`Server started on port ${port}`);
  })
);
// Export our server instance so other parts of our code can access it if necessary.
export default server;
