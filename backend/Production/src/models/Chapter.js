"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chapter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const softDeletePlugin_1 = require("../models/plugins/softDeletePlugin");
const ChapterSchema = new mongoose_1.default.Schema({
    unitId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    name: { type: String, required: true },
    orderIndex: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null },
});
ChapterSchema.plugin(softDeletePlugin_1.softDeletePlugin);
exports.Chapter = mongoose_1.default.model("Chapter", ChapterSchema);