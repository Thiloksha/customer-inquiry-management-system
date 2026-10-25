
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("GET /health", () => {
  it("returns 200 and a healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /inquiries authentication", () => {
  it("rejects requests without an authentication token", async () => {
    const response = await request(app).get("/inquiries");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Authentication required.",
    });
  });
});
