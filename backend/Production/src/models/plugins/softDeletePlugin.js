"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeletePlugin = softDeletePlugin;
const mongoose_1 = require("mongoose");
function shouldIncludeDeleted(query) {
    const opts = query?.getOptions?.() ?? {};
    return opts.includeDeleted === true;
}
function softDeletePlugin(schema) {
    schema.add({
        deletedAt: { type: Date, default: null, index: true },
        deletedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null }
    });
    const excludeDeleted = function () {
        if (shouldIncludeDeleted(this))
            return;
        const filter = this.getFilter?.() ?? {};
        if (Object.prototype.hasOwnProperty.call(filter, "deletedAt"))
            return;
        this.where({ deletedAt: null });
    };
    schema.pre("find", excludeDeleted);
    schema.pre("findOne", excludeDeleted);
    schema.pre("countDocuments", excludeDeleted);
    schema.pre("findOneAndUpdate", excludeDeleted);
    schema.pre("aggregate", function () {
        const opts = this.options ?? {};
        if (opts.includeDeleted === true)
            return;
        const pipeline = this.pipeline();
        const hasDeletedMatch = pipeline.some((stage) => stage.$match && stage.$match.deletedAt !== undefined);
        if (!hasDeletedMatch) {
            this.pipeline().unshift({ $match: { deletedAt: null } });
        }
    });
}
//# sourceMappingURL=softDeletePlugin.js.map