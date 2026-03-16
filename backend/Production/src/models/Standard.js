"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Standard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const softDeletePlugin_1 = require("../models/plugins/softDeletePlugin");
const StandardSchema = new mongoose_1.default.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null },
});
StandardSchema.plugin(softDeletePlugin_1.softDeletePlugin);
exports.Standard = mongoose_1.default.model("Standard", StandardSchema);