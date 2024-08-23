// tests/unit/app.test.js

import request from "supertest";

import app from "../../src/app.js";

describe("GET /non-existing-routes", () => {
  // Request the non-existing route should return the error 404 (route not found)
  test("should return HTTP 404 response", async () => {
    const res = await request(app).get("/non-existing-route");
    expect(res.statusCode).toBe(404);
  });
});
