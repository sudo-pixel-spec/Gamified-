"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const agendaDriver_js_1 = require("./jobs/agendaDriver.js");
async function main() {
    await mongoose_1.default.connect(env_1.env.MONGODB_URI);
    const agenda = await (0, agendaDriver_js_1.getAgenda)();
    await agenda.start();
    console.log("[worker] agenda started");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});