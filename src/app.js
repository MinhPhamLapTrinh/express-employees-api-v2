// src/app.js

// https://expressjs.com/
import express from "express";

// https://www.npmjs.com/package/cors
import cors from "cors";

// https://www.npmjs.com/package/helmet
import helmet from "helmet";

// https://www.npmjs.com/package/compression
import compression from "compression";

// https://www.npmjs.com/package/body-parser
import bodyParser from "body-parser";

// author and version from our package.json file
// https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#no-require-exports-or-moduleexports
// ESLint hasn't supported assertion yet
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { author, version } = require("../package.json");

// Get our Logger
import logger from "./logger.js";

// https://github.com/pinojs/pino-pretty
import pinoHttp from "pino-http";

// Use our default logger instance, which is already configured
const pino = pinoHttp({
  logger,
});

const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmet.js security middleware
app.use(helmet());

// Use gzip/deflate compression middleware
app.use(compression());

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Define a simple health check route. If the server is running
// We'll respond with a 200 OK. If not, the server isn't healthy.
app.get("/", (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  res.setHeader("Cache-Control", "no-cache");

  // Send a 200 'ok' response with the info about our information
  res.status(200).json({
    status: "ok",
    author,
    version,
  });
});

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    error: {
      message: "not found",
      code: 404,
    },
  });
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // We may already have an error response we can use, but if not,
  // use a generic `500` server error and message.
  const status = err.status || 500;
  const message = err.message || "unable to process request";

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: "error",
    error: {
      message,
      code: status,
    },
  });
});

// Export our `app` so we can access it in server.js
export default app;
