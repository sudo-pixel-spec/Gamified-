"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.isDbReady = isDbReady;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let isConnecting = false;
async function connectDB() {
    if (mongoose_1.default.connection.readyState === 1)
        return;
    if (isConnecting)
        return;
    isConnecting = true;
    mongoose_1.default.set("strictQuery", true);
    mongoose_1.default.connection.on("connected", () => {
        console.log("✅ MongoDB connected");
    });
    mongoose_1.default.connection.on("error", (err) => {
        console.error("❌ MongoDB error:", err);
    });
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB disconnected");
    });
    await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });
    isConnecting = false;
}
function isDbReady() {
    return mongoose_1.default.connection.readyState === 1;
}
async function disconnectDB() {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
        console.log("MongoDB disconnected");
    }
}