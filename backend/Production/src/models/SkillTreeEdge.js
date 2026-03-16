"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillTreeEdge = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SkillTreeEdgeSchema = new mongoose_1.default.Schema({
    fromNodeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "SkillTreeNode", required: true, index: true },
    toNodeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "SkillTreeNode", required: true, index: true },
    standardId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Standard", required: true, index: true }
}, { timestamps: true });
SkillTreeEdgeSchema.index({ fromNodeId: 1, toNodeId: 1 }, { unique: true });
exports.SkillTreeEdge = mongoose_1.default.model("SkillTreeEdge", SkillTreeEdgeSchema);