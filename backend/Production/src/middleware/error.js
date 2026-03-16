"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const apiResponse_1 = require("../utils/apiResponse");
function errorHandler(err, req, res, _next) {
    const requestId = req.requestId;
    const status = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const code = err?.code ?? (status === 500 ? "INTERNAL" : "ERROR");
    const message = err?.message ?? "Something went wrong";
    if (status >= 500) {
        console.error({ requestId, err });
    }
    res.status(status).json((0, apiResponse_1.fail)(code, message, { requestId }));
}