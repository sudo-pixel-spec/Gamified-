"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
function ok(data) {
    return { ok: true, data };
}
function fail(code, message, details) {
    return { ok: false, error: { code, message, details } };
}