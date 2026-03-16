"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = require("../src/app");
const User_1 = require("../src/models/User");
const Attempt_1 = require("../src/models/Attempt");
const WalletTransaction_1 = require("../src/models/WalletTransaction");
const auth_1 = require("./helpers/auth");
const seedLessonQuiz_1 = require("./helpers/seedLessonQuiz");
let replset;
describe("Attempts submit", () => {
    beforeAll(async () => {
        replset = await mongodb_memory_server_1.MongoMemoryReplSet.create({
            replSet: { count: 1 }
        });
        await mongoose_1.default.connect(replset.getUri());
    });
    afterEach(async () => {
        await mongoose_1.default.connection.db?.dropDatabase();
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await replset.stop();
    });
    it("should require auth", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)();
        const res = await (0, supertest_1.default)(app).post("/v1/attempts/submit").send({
            lessonId: lesson._id.toString(),
            answers: [],
            idempotencyKey: "k1"
        });
        expect(res.status).toBe(401);
    });
    it("should require profile complete", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)();
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1234567899");
        const res = await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [],
            idempotencyKey: "k2"
        });
        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("PROFILE_INCOMPLETE");
    });
    it("should score answers, award xp/coins, update user, create attempt + wallet txns", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1111111111");
        await (0, auth_1.completeProfile)(app, token);
        const res = await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 0 }
            ],
            timeSpentSec: 40,
            idempotencyKey: "k3"
        });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.score).toBe(2);
        expect(res.body.data.total).toBe(3);
        expect(res.body.data.xpAwarded).toBeGreaterThan(0);
        const user = await User_1.User.findOne({ phone: "1111111111" });
        expect(user).toBeTruthy();
        expect(user.totalXP).toBe(res.body.data.xpAwarded);
        expect(user.wallet?.coins).toBe(res.body.data.coinsAwarded);
        const attempts = await Attempt_1.Attempt.find({}).lean();
        expect(attempts.length).toBe(1);
        expect(attempts[0]?.score).toBe(2);
        expect(attempts[0]?.answers?.length).toBe(3);
        const txns = await WalletTransaction_1.WalletTransaction.find({ userId: user._id }).lean();
        expect(txns.length).toBe(2);
    });
    it("should award diamonds only for hard + perfect score", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("hard");
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "2222222222");
        await (0, auth_1.completeProfile)(app, token);
        const res = await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            idempotencyKey: "k4"
        });
        expect(res.status).toBe(200);
        expect(res.body.data.score).toBe(3);
        expect(res.body.data.diamondsAwarded).toBeGreaterThan(0);
        const user = await User_1.User.findOne({ phone: "2222222222" });
        expect(user.wallet?.diamonds).toBe(res.body.data.diamondsAwarded);
    });
    it("idempotency should prevent double awarding", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "3333333333");
        await (0, auth_1.completeProfile)(app, token);
        const payload = {
            lessonId: lesson._id.toString(),
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            idempotencyKey: "same-key"
        };
        const res1 = await (0, supertest_1.default)(app).post("/v1/attempts/submit").set("Authorization", `Bearer ${token}`).send(payload);
        const res2 = await (0, supertest_1.default)(app).post("/v1/attempts/submit").set("Authorization", `Bearer ${token}`).send(payload);
        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
        const user = await User_1.User.findOne({ phone: "3333333333" });
        expect(user).toBeTruthy();
        const attempts = await Attempt_1.Attempt.find({}).lean();
        expect(attempts.length).toBe(1);
        expect(user.totalXP).toBe(res1.body.data.xpAwarded);
    });
});