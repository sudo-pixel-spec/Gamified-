"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAiLog = writeAiLog;
const aiLogJob_1 = require("../handlers/aiLogJob");
async function writeAiLog(payload) {
    const fakeJob = { attrs: { data: payload } };
    await (0, aiLogJob_1.aiLogJob)(fakeJob);
}