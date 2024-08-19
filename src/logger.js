// src/logger.js

// https://github.com/pinojs/pino-pretty
import pino from "pino";

const options = { level: process.env.LOG_LEVEL || "info" };

// If we're doing `debug` logging, make the logs easier to read
if (options.level === "debug") {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

// Create and export a Pino Logger instance:
export default pino(options);
