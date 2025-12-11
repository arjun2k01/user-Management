// backend/tests/auth.test.js
import request from "supertest";
import app from "../app.js";

describe("Health endpoint", () => {
  it("should respond to /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
