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
let replset;
async function loginAndGetAccessToken(app, phone) {
    await (0, supertest_1.default)(app).post("/v1/auth/request-otp").send({ phone });
    const knownOtp = "123456";
    const rec = await Otp_1.Otp.findOne({ phone });
    if (!rec)
        throw new Error("OTP record missing");
    rec.otpHash = await bcryptjs_1.default.hash(knownOtp, 10);
    await rec.save();
    const res = await (0, supertest_1.default)(app)
        .post("/v1/auth/verify-otp")
        .send({ phone, otp: knownOtp });
    return res.body.data.accessToken;
}
describe("User endpoints", () => {
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
    it("GET /me should require auth", async () => {
        const app = (0, app_1.createApp)();
        const res = await (0, supertest_1.default)(app).get("/v1/me");
        expect(res.status).toBe(401);
    });
    it("GET /me should return user data", async () => {
        const app = (0, app_1.createApp)();
        const token = await loginAndGetAccessToken(app, "1234567890");
        const res = await (0, supertest_1.default)(app)
            .get("/v1/me")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.phone).toBe("1234567890");
    });
    it("PATCH /me/profile should complete profile", async () => {
        const app = (0, app_1.createApp)();
        const token = await loginAndGetAccessToken(app, "1000000021");
        const res = await (0, supertest_1.default)(app)
            .patch("/v1/me/profile")
            .set("Authorization", `Bearer ${token}`)
            .send({
            fullName: "Test User",
            standard: "CBSE_STD_8",
            timezone: "Asia/Kolkata"
        });
        expect(res.status).toBe(200);
        expect(res.body.data.profileComplete).toBe(true);
    });
});