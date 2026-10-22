// server/src/routes/__tests__/auth.integration.test.js

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("Users who register can now login", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ email: "alice@example.com", displayName: "Alice", password: "correcthorse" });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "alice@example.com", password: "correcthorse" });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body.accessToken).toBeDefined();
});
