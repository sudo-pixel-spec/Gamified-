"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
const apiResponse_1 = require("../utils/apiResponse");
function notFound(_req, res) {
    res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Route not found"));
}