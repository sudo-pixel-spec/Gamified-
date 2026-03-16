"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = require("../src/app");
const UserWeeklyStats_1 = require("../src/models/UserWeeklyStats");
const auth_1 = require("./helpers/auth");
const seedLessonQuiz_1 = require("./helpers/seedLessonQuiz");
let replset;
describe("Leaderboards", () => {
    beforeAll(async () => {
        replset = await mongodb_memory_server_1.MongoMemoryReplSet.create({ replSet: { count: 1 } });
        await mongoose_1.default.connect(replset.getUri());
    });
    afterEach(async () => {
        await mongoose_1.default.connection.db?.dropDatabase();
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await replset.stop();
    });
    it("should create weekly stats on attempt submit and return leaderboard entries", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const t1 = await (0, auth_1.loginAndGetAccessToken)(app, "1000000017");
        await (0, auth_1.completeProfile)(app, t1);
        await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${t1}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            timeSpentSec: 30,
            idempotencyKey: "u1-k1"
        });
        const t2 = await (0, auth_1.loginAndGetAccessToken)(app, "1000000018");
        await (0, auth_1.completeProfile)(app, t2);
        await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${t2}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 0 },
                { qid: "q3", selectedIndex: 0 }
            ],
            timeSpentSec: 30,
            idempotencyKey: "u2-k1"
        });
        const stats = await UserWeeklyStats_1.UserWeeklyStats.find({}).lean();
        expect(stats.length).toBe(2);
        const lb = await (0, supertest_1.default)(app)
            .get("/v1/leaderboards/weekly-growth")
            .set("Authorization", `Bearer ${t1}`);
        expect(lb.status).toBe(200);
        expect(lb.body.ok).toBe(true);
        expect(lb.body.data.entries.length).toBeGreaterThanOrEqual(2);
        expect(lb.body.data.entries[0].userId).not.toBeNull();
    });
    it("anti-grind: repeating same lesson in same week should not increase lessonsCompleted/eligibleXP", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000019");
        await (0, auth_1.completeProfile)(app, token);
        await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            timeSpentSec: 30,
            idempotencyKey: "g-1"
        });
        await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            timeSpentSec: 30,
            idempotencyKey: "g-2"
        });
        const stat = await UserWeeklyStats_1.UserWeeklyStats.findOne({}).lean();
        expect(stat).toBeTruthy();
        expect(stat.lessonsCompleted).toBe(1);
        expect(stat.eligibleXP).toBeGreaterThan(0);
    });
    it("ineligible attempt (timeSpentSec < 20) should not count lessonsCompleted/eligibleXP, but should count accuracy aggregates", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000020");
        await (0, auth_1.completeProfile)(app, token);
        await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            timeSpentSec: 5,
            idempotencyKey: "f-1"
        });
        const stat = await UserWeeklyStats_1.UserWeeklyStats.findOne({}).lean();
        expect(stat).toBeTruthy();
        expect(stat.lessonsCompleted).toBe(0);
        expect(stat.eligibleXP).toBe(0);
        expect(stat.questionsAttempted).toBe(3);
        expect(stat.questionsCorrect).toBe(3);
    });
});