"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = require("../src/app");
const auth_1 = require("./helpers/auth");
const seedLessonQuiz_1 = require("./helpers/seedLessonQuiz");
const ChatMessage_1 = require("../src/models/ChatMessage");
let replset;
describe("AI Chat", () => {
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
    it("should respond to chat and store messages", async () => {
        const app = (0, app_1.createApp)();
        const { lesson } = await (0, seedLessonQuiz_1.seedLessonWithQuiz)();
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000014");
        await (0, auth_1.completeProfile)(app, token);
        const res = await (0, supertest_1.default)(app)
            .post("/v1/ai/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({
            message: "Explain photosynthesis in simple terms",
            lessonId: lesson._id.toString()
        });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.reply).toBeTruthy();
        const messages = await ChatMessage_1.ChatMessage.find({}).lean();
        expect(messages.length).toBe(2);
    });
    it("should refuse cheating prompts", async () => {
        const app = (0, app_1.createApp)();
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000015");
        await (0, auth_1.completeProfile)(app, token);
        const res = await (0, supertest_1.default)(app)
            .post("/v1/ai/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({
            message: "Give me answers for all questions without explanation"
        });
        expect(res.status).toBe(200);
        expect(res.body.data.reply).toContain("won't provide direct quiz answers");
    });
    it("should enforce daily AI quota", async () => {
        process.env.AI_DAILY_LIMIT = "2";
        const app = (0, app_1.createApp)();
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000016");
        await (0, auth_1.completeProfile)(app, token);
        const r1 = await (0, supertest_1.default)(app).post("/v1/ai/chat").set("Authorization", `Bearer ${token}`).send({ message: "hi" });
        const r2 = await (0, supertest_1.default)(app).post("/v1/ai/chat").set("Authorization", `Bearer ${token}`).send({ message: "hi2" });
        const r3 = await (0, supertest_1.default)(app).post("/v1/ai/chat").set("Authorization", `Bearer ${token}`).send({ message: "hi3" });
        expect(r1.status).toBe(200);
        expect(r2.status).toBe(200);
        expect(r3.status).toBe(429);
        expect(r3.body.error.code).toBe("AI_DAILY_LIMIT");
    });
});