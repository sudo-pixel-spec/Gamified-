"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = require("../src/app");
const Otp_1 = require("../src/models/Otp");
const Attempt_1 = require("../src/models/Attempt");
const seedCurriculum_1 = require("./helpers/seedCurriculum");
let mongod;
async function loginAndGetAccessToken(app, phone) {
    await (0, supertest_1.default)(app).post("/v1/auth/request-otp").send({ phone });
    const knownOtp = "123456";
    const rec = await Otp_1.Otp.findOne({ phone });
    if (!rec)
        throw new Error("OTP record missing");
    rec.otpHash = await bcryptjs_1.default.hash(knownOtp, 10);
    await rec.save();
    const res = await (0, supertest_1.default)(app).post("/v1/auth/verify-otp").send({ phone, otp: knownOtp });
    return res.body.data.accessToken;
}
async function completeProfile(app, token) {
    const res = await (0, supertest_1.default)(app)
        .patch("/v1/me/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Test User", standard: "CBSE_STD_8", timezone: "Asia/Kolkata" });
    if (res.status !== 200) {
        throw new Error(`Profile completion failed: ${JSON.stringify(res.body)}`);
    }
}
describe("Curriculum + Unlocking", () => {
    beforeAll(async () => {
        mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
        await mongoose_1.default.connect(mongod.getUri());
    });
    afterEach(async () => {
        await mongoose_1.default.connection.db?.dropDatabase();
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongod.stop();
    });
    it("GET /v1/curriculum/standards returns standards (no auth)", async () => {
        const app = (0, app_1.createApp)();
        await (0, seedCurriculum_1.seedCurriculumStd8)();
        const res = await (0, supertest_1.default)(app).get("/v1/curriculum/standards");
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        const codes = res.body.data.map((s) => s.code);
        expect(codes).toEqual(expect.arrayContaining(["CBSE_STD_8", "CBSE_STD_9", "CBSE_STD_10"]));
    });
    it("GET /v1/curriculum/subjects returns subjects for a standard", async () => {
        const app = (0, app_1.createApp)();
        const seeded = await (0, seedCurriculum_1.seedCurriculumStd8)();
        const res = await (0, supertest_1.default)(app)
            .get("/v1/curriculum/subjects")
            .query({ standardId: seeded.standards.std8._id.toString() });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe("Science");
    });
    it("GET /v1/units returns units for a subject", async () => {
        const app = (0, app_1.createApp)();
        const seeded = await (0, seedCurriculum_1.seedCurriculumStd8)();
        const res = await (0, supertest_1.default)(app).get("/v1/units").query({ subjectId: seeded.subject._id.toString() });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe("Biology Basics");
    });
    it("GET /v1/chapters returns chapters for a unit", async () => {
        const app = (0, app_1.createApp)();
        const seeded = await (0, seedCurriculum_1.seedCurriculumStd8)();
        const res = await (0, supertest_1.default)(app).get("/v1/chapters").query({ unitId: seeded.unit._id.toString() });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe("Photosynthesis");
    });
    it("GET /v1/lessons requires auth and profile complete", async () => {
        const app = (0, app_1.createApp)();
        const seeded = await (0, seedCurriculum_1.seedCurriculumStd8)();
        const resNoAuth = await (0, supertest_1.default)(app).get("/v1/lessons").query({ chapterId: seeded.chapter._id.toString() });
        expect(resNoAuth.status).toBe(401);
        const token = await loginAndGetAccessToken(app, "1111111111");
        const resNoProfile = await (0, supertest_1.default)(app)
            .get("/v1/lessons")
            .query({ chapterId: seeded.chapter._id.toString() })
            .set("Authorization", `Bearer ${token}`);
        expect(resNoProfile.status).toBe(403);
        expect(resNoProfile.body.ok).toBe(false);
        expect(resNoProfile.body.error.code).toBe("PROFILE_INCOMPLETE");
    });
    it("Unlocking: only first lesson unlocked initially; next unlocks after attempt", async () => {
        const app = (0, app_1.createApp)();
        const seeded = await (0, seedCurriculum_1.seedCurriculumStd8)();
        const token = await loginAndGetAccessToken(app, "2222222222");
        await completeProfile(app, token);
        const res1 = await (0, supertest_1.default)(app)
            .get("/v1/lessons")
            .query({ chapterId: seeded.chapter._id.toString() })
            .set("Authorization", `Bearer ${token}`);
        expect(res1.status).toBe(200);
        const lessons1 = res1.body.data;
        expect(lessons1.map((l) => l.title)).toEqual([
            "Lesson 1: Introduction",
            "Lesson 2: Process",
            "Lesson 3: Factors"
        ]);
        expect(lessons1[0].unlocked).toBe(true);
        expect(lessons1[0].completed).toBe(false);
        expect(lessons1[1].unlocked).toBe(false);
        expect(lessons1[2].unlocked).toBe(false);
        const userId = (await (0, supertest_1.default)(app).get("/v1/me").set("Authorization", `Bearer ${token}`)).body.data.id;
        await Attempt_1.Attempt.create({
            userId,
            lessonId: seeded.lessons[0]._id,
            quizVersion: 1,
            answers: [],
            score: 1,
            totalQuestions: 1,
            xpAwarded: 0,
            coinsAwarded: 0,
            diamondsAwarded: 0,
            idempotencyKey: "curriculum-test"
        });
        const res2 = await (0, supertest_1.default)(app)
            .get("/v1/lessons")
            .query({ chapterId: seeded.chapter._id.toString() })
            .set("Authorization", `Bearer ${token}`);
        expect(res2.status).toBe(200);
        const lessons2 = res2.body.data;
        expect(lessons2[0].completed).toBe(true);
        expect(lessons2[1].unlocked).toBe(true);
        expect(lessons2[2].unlocked).toBe(false);
    });
});