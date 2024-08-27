// tests/unit/response.js

import {
  createSuccessResponse,
  createErrorResponse,
} from "../../src/response.js";

describe("Controllers Response", () => {
  // Writing a test for calling createErrorResponse()
  test("createErrorResponse()", () => {
    const errorResponse = createErrorResponse(404, "not found");
    expect(errorResponse).toEqual({
      status: "error",
      error: {
        code: 404,
        message: "not found",
      },
    });
  });

  // Writing a test for calling createSuccessResponse() with no argument
  test("createSuccessResponse() no arguments", () => {
    const successResponse = createSuccessResponse();
    expect(successResponse).toEqual({
      status: "ok",
    });
  });

  // Writing a test for calling createSuccessResponse() with argument
  test("createSuccessResponse() with arguments", () => {
    const successResponse = createSuccessResponse({ a: 1, b: 1 });
    expect(successResponse).toEqual({
      status: "ok",
      a: 1,
      b: 1,
    });
  });
});
