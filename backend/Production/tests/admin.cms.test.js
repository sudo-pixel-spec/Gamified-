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
const Standard_1 = require("../src/models/Standard");
const Quiz_1 = require("../src/models/Quiz");
const Subject_1 = require("../src/models/Subject");
const Unit_1 = require("../src/models/Unit");
const Chapter_1 = require("../src/models/Chapter");
const Lesson_1 = require("../src/models/Lesson");
const auth_1 = require("./helpers/auth");
const seedLessonQuiz_1 = require("./helpers/seedLessonQuiz");
let replset;
async function makeAdmin(app, phone) {
    const token = await (0, auth_1.loginAndGetAccessToken)(app, phone);
    await (0, auth_1.completeProfile)(app, token);
    await User_1.User.updateOne({ phone }, { $set: { role: "admin" } });
    const token2 = await (0, auth_1.loginAndGetAccessToken)(app, phone);
    return token2;
}
describe("Admin CMS", () => {
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
    it("should forbid non-admin access", async () => {
        const app = (0, app_1.createApp)();
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000001");
        await (0, auth_1.completeProfile)(app, token);
        const res = await (0, supertest_1.default)(app)
            .get("/v1/admin/standards")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
    it("admin can create/list/update/delete standard", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000002");
        const createRes = await (0, supertest_1.default)(app)
            .post("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ code: "CBSE_STD_8", name: "Std 8", active: true });
        expect(createRes.status).toBe(201);
        expect(createRes.body.data.code).toBe("CBSE_STD_8");
        const listRes = await (0, supertest_1.default)(app)
            .get("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(listRes.status).toBe(200);
        expect(listRes.body.data.total).toBe(1);
        const id = createRes.body.data._id;
        const updRes = await (0, supertest_1.default)(app)
            .patch(`/v1/admin/standards/${id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "Class 8" });
        expect(updRes.status).toBe(200);
        expect(updRes.body.data.name).toBe("Class 8");
        const delRes = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/standards/${id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(delRes.status).toBe(200);
        expect(await Standard_1.Standard.countDocuments({ deletedAt: null })).toBe(0);
        expect(await Standard_1.Standard.countDocuments({ deletedAt: { $ne: null } })).toBe(1);
    });
    it("admin can create next quiz version for a lesson", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000003");
        const seeded = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const lessonId = seeded.lesson._id.toString();
        const v2 = await (0, supertest_1.default)(app)
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
        const latest = await (0, supertest_1.default)(app)
            .get("/v1/admin/quizzes/latest")
            .set("Authorization", `Bearer ${adminToken}`)
            .query({ lessonId });
        expect(latest.status).toBe(200);
        expect(latest.body.data.version).toBe(2);
    });
    it("publish safeguard: only one published quiz per lesson", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000004");
        const seeded = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const lessonId = seeded.lesson._id.toString();
        const v2 = await (0, supertest_1.default)(app)
            .post("/v1/admin/quizzes/version")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
            lessonId,
            difficulty: "hard",
            source: "seed",
            published: false,
            questions: [{ qid: "n1", prompt: "New Q1", options: ["a", "b"], answerIndex: 1 }]
        });
        expect(v2.status).toBe(201);
        const v1Doc = await Quiz_1.Quiz.findOne({ lessonId, version: 1 }).lean();
        const v2Id = v2.body.data._id;
        expect(v1Doc).toBeTruthy();
        expect(v1Doc.published).toBe(true);
        const pub = await (0, supertest_1.default)(app)
            .patch(`/v1/admin/quizzes/${v2Id}/publish`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({});
        expect(pub.status).toBe(200);
        expect(pub.body.data.published).toBe(true);
        const afterV1 = await Quiz_1.Quiz.findOne({ lessonId, version: 1 }).lean();
        const afterV2 = await Quiz_1.Quiz.findOne({ lessonId, version: 2 }).lean();
        expect(afterV1.published).toBe(false);
        expect(afterV2.published).toBe(true);
        const publishedCount = await Quiz_1.Quiz.countDocuments({ lessonId, published: true });
        expect(publishedCount).toBe(1);
    });
    it("delete safeguard: cannot delete standard if subjects exist", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000005");
        const std = await (0, supertest_1.default)(app)
            .post("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ code: "CBSE_STD_8", name: "Std 8", active: true });
        const standardId = std.body.data._id;
        await Subject_1.Subject.create({ standardId, name: "Science", orderIndex: 1 });
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/standards/${standardId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(409);
        expect(del.body.ok).toBe(false);
        expect(del.body.error.code).toBe("HAS_CHILDREN");
    });
    it("delete safeguard: cannot delete subject if units exist", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000006");
        const std = await (0, supertest_1.default)(app)
            .post("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ code: "CBSE_STD_8", name: "Std 8", active: true });
        const subject = await Subject_1.Subject.create({ standardId: std.body.data._id, name: "Science", orderIndex: 1 });
        await Unit_1.Unit.create({ subjectId: subject._id, name: "Unit 1", orderIndex: 1 });
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/subjects/${subject._id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(409);
        expect(del.body.error.code).toBe("HAS_CHILDREN");
    });
    it("delete safeguard: cannot delete unit if chapters exist", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000007");
        const std = await (0, supertest_1.default)(app)
            .post("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ code: "CBSE_STD_8", name: "Std 8", active: true });
        const subject = await Subject_1.Subject.create({ standardId: std.body.data._id, name: "Science", orderIndex: 1 });
        const unit = await Unit_1.Unit.create({ subjectId: subject._id, name: "Unit 1", orderIndex: 1 });
        await Chapter_1.Chapter.create({ unitId: unit._id, name: "Ch 1", orderIndex: 1 });
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/units/${unit._id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(409);
        expect(del.body.error.code).toBe("HAS_CHILDREN");
    });
    it("delete safeguard: cannot delete chapter if lessons exist", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000008");
        const std = await (0, supertest_1.default)(app)
            .post("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ code: "CBSE_STD_8", name: "Std 8", active: true });
        const subject = await Subject_1.Subject.create({ standardId: std.body.data._id, name: "Science", orderIndex: 1 });
        const unit = await Unit_1.Unit.create({ subjectId: subject._id, name: "Unit 1", orderIndex: 1 });
        const chapter = await Chapter_1.Chapter.create({ unitId: unit._id, name: "Ch 1", orderIndex: 1 });
        await Lesson_1.Lesson.create({ chapterId: chapter._id, title: "L1", orderIndex: 1, published: true });
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/chapters/${chapter._id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(409);
        expect(del.body.error.code).toBe("HAS_CHILDREN");
    });
    it("delete safeguard: cannot delete lesson if quizzes exist", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000009");
        const seeded = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const lessonId = seeded.lesson._id.toString();
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(409);
        expect(del.body.error.code).toBe("HAS_CHILDREN");
    });
    it("delete safeguard: cannot delete lesson if attempts exist", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000010");
        const seeded = await (0, seedLessonQuiz_1.seedLessonWithQuiz)("medium");
        const lessonId = seeded.lesson._id.toString();
        const token = await (0, auth_1.loginAndGetAccessToken)(app, "1000000011");
        await (0, auth_1.completeProfile)(app, token);
        await (0, supertest_1.default)(app)
            .post("/v1/attempts/submit")
            .set("Authorization", `Bearer ${token}`)
            .send({
            lessonId,
            answers: [
                { qid: "q1", selectedIndex: 0 },
                { qid: "q2", selectedIndex: 1 },
                { qid: "q3", selectedIndex: 2 }
            ],
            timeSpentSec: 30,
            idempotencyKey: "guard-attempt-1"
        });
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(409);
        expect(del.body.error.code).toBe("HAS_CHILDREN");
    });
    it("soft delete: deleted items excluded from admin list by default, included with includeDeleted=true, and can be restored", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000012");
        const createRes = await (0, supertest_1.default)(app)
            .post("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ code: "CBSE_STD_8", name: "Std 8", active: true });
        const id = createRes.body.data._id;
        const del = await (0, supertest_1.default)(app)
            .delete(`/v1/admin/standards/${id}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(del.status).toBe(200);
        const listDefault = await (0, supertest_1.default)(app)
            .get("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(listDefault.status).toBe(200);
        expect(listDefault.body.data.total).toBe(0);
        const listIncl = await (0, supertest_1.default)(app)
            .get("/v1/admin/standards?includeDeleted=true")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(listIncl.status).toBe(200);
        expect(listIncl.body.data.total).toBe(1);
        expect(listIncl.body.data.items[0].deletedAt).toBeTruthy();
        const restore = await (0, supertest_1.default)(app)
            .patch(`/v1/admin/standards/${id}/restore`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(restore.status).toBe(200);
        expect(restore.body.data.deletedAt).toBe(null);
        const listAfter = await (0, supertest_1.default)(app)
            .get("/v1/admin/standards")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(listAfter.body.data.total).toBe(1);
    });
    it("admin jobs status returns enabled false when jobs disabled", async () => {
        const app = (0, app_1.createApp)();
        const adminToken = await makeAdmin(app, "1000000013");
        process.env.JOBS_ENABLED = "false";
        const res = await (0, supertest_1.default)(app)
            .get("/v1/admin/jobs/status")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.enabled).toBe(false);
    });
});