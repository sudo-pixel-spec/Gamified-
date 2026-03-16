"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weekWindow = weekWindow;
function weekWindow(weekStartISO) {
    const start = new Date(weekStartISO + "T00:00:00.000Z");
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start, end };
}