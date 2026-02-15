import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import { createApp } from "../src/app";
import { User } from "../src/models/User";
import { Standard } from "../src/models/Standard";

import { loginAndGetAccessToken, completeProfile } from "./helpers/auth";
import { seedLessonWithQuiz } from "./helpers/seedLessonQuiz";

let replset: MongoMemoryReplSet;

async function makeAdmin(app: any, email: string) {
  const token = await loginAndGetAccessToken(app, email);
  await completeProfile(app, token);
  await User.updateOne({ email }, { $set: { role: "admin" } });
  const token2 = await loginAndGetAccessToken(app, email);
  return token2;
}

describe("Admin CMS", () => {
  beforeAll(async () => {
    replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(replset.getUri());
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await replset.stop();
  });

  it("should forbid non-admin access", async () => {
    const app = createApp();
    const token = await loginAndGetAccessToken(app, "user@x.com");
    await completeProfile(app, token);

    const res = await request(app)
      .get("/v1/admin/standards")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("admin can create/list/update/delete standard", async () => {
    const app = createApp();
    const adminToken = await makeAdmin(app, "admin@x.com");

    const createRes = await request(app)
      .post("/v1/admin/standards")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ code: "CBSE_STD_8", name: "Std 8", active: true });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.code).toBe("CBSE_STD_8");

    const listRes = await request(app)
      .get("/v1/admin/standards")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.total).toBe(1);

    const id = createRes.body.data._id;

    const updRes = await request(app)
      .patch(`/v1/admin/standards/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Class 8" });

    expect(updRes.status).toBe(200);
    expect(updRes.body.data.name).toBe("Class 8");

    const delRes = await request(app)
      .delete(`/v1/admin/standards/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(delRes.status).toBe(200);

    expect(await Standard.countDocuments()).toBe(0);
  });

  it("admin can create next quiz version for a lesson", async () => {
    const app = createApp();
    const adminToken = await makeAdmin(app, "admin2@x.com");

    const seeded = await seedLessonWithQuiz("medium");
    const lessonId = seeded.lesson._id.toString();

    const v2 = await request(app)
      .post("/v1/admin/quizzes/version")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        lessonId,
        difficulty: "hard",
        source: "seed",
        published: true,
        questions: [
          { qid: "n1", prompt: "New Q1", options: ["a", "b"], answerIndex: 1, explanation: "E" }
        ]
      });

    expect(v2.status).toBe(201);
    expect(v2.body.data.version).toBe(2);
    expect(v2.body.data.published).toBe(true);

    const latest = await request(app)
      .get("/v1/admin/quizzes/latest")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({ lessonId });

    expect(latest.status).toBe(200);
    expect(latest.body.data.version).toBe(2);
  });
});
