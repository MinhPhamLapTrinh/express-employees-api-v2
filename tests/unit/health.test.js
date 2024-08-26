// tests/unit/health.test.js

import request from "supertest";

import app from "../../src/app.js";

// author and version from our package.json file
// https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#no-require-exports-or-moduleexports
// ESLint hasn't supported assertion yet
const author = "Duc Minh, Pham";
const version = "0.0.1";

describe("/ health check", () => {
  test("should return HTTP 200 response", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  test("should return Cache-Control: no-cache header", async () => {
    const res = await request(app).get("/");
    expect(res.headers["cache-control"]).toEqual("no-cache");
  });

  test("should return status: ok in response", async () => {
    const res = await request(app).get("/");
    expect(res.body.status).toEqual("ok");
  });

  test("should return correct version and author in response", async () => {
    const res = await request(app).get("/");
    expect(res.body.author).toEqual(author);
    expect(res.body.version).toEqual(version);
  });
});
