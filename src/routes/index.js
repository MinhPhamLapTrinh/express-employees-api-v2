// src/routes/index.js

import express from "express";

// Get our API
import apiRouter from "./api/index.js";

// Create a router that we can use to mount our API
const router = express.Router();

// author and version from our package.json file
// https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#no-require-exports-or-moduleexports
// ESLint hasn't supported assertion yet
// import { createRequire } from "node:module";
// const require = createRequire(import.meta.url);
// const { author, version } = require("../../package.json");
const author = "Duc Minh, Pham";
const version = "0.0.1";
/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, apiRouter);

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get("/", (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  res.setHeader("Cache-Control", "no-cache");

  // Send a 200 'ok' response with the info about our information
  res.status(200).json({
    status: "ok",
    author,
    version,
  });
});

export default router;
