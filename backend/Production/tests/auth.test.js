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
describe("Auth OTP flow", () => {
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
    it("request-otp should create OTP record", async () => {
        const app = (0, app_1.createApp)();
        const res = await (0, supertest_1.default)(app)
            .post("/v1/auth/request-otp")
            .send({ phone: "1234567890" });
        expect(res.status).toBe(200);
        const rec = await Otp_1.Otp.findOne({ phone: "1234567890" });
        expect(rec).toBeTruthy();
    });
    it("verify-otp with wrong code should fail", async () => {
        const app = (0, app_1.createApp)();
        await (0, supertest_1.default)(app)
            .post("/v1/auth/request-otp")
            .send({ phone: "0987654321" });
        const res = await (0, supertest_1.default)(app)
            .post("/v1/auth/verify-otp")
            .send({ phone: "0987654321", otp: "000000" });
        expect(res.status).toBe(401);
        expect(res.body.ok).toBe(false);
    });
    it("verify-otp with correct code should succeed and set refresh cookie", async () => {
        const app = (0, app_1.createApp)();
        const phone = "1231231234";
        await (0, supertest_1.default)(app)
            .post("/v1/auth/request-otp")
            .send({ phone });
        const knownOtp = "123456";
        const rec = await Otp_1.Otp.findOne({ phone });
        if (!rec)
            throw new Error("OTP record missing");
        rec.otpHash = await bcryptjs_1.default.hash(knownOtp, 10);
        await rec.save();
        const res = await (0, supertest_1.default)(app)
            .post("/v1/auth/verify-otp")
            .send({ phone, otp: knownOtp });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.data.accessToken).toBeTruthy();
        const cookies = String(res.headers["set-cookie"] || "");
        expect(cookies).toContain("refresh_token=");
    });
});