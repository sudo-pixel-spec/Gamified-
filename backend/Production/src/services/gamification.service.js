"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateXP = calculateXP;
exports.calculateLevel = calculateLevel;
exports.calculateCoins = calculateCoins;
exports.calculateDiamonds = calculateDiamonds;
exports.updateStreak = updateStreak;
function calculateXP(score, total, difficulty) {
    const accuracy = score / total;
    let baseXP = 50;
    if (difficulty === "hard")
        baseXP = 100;
    if (difficulty === "easy")
        baseXP = 30;
    const xp = Math.round(baseXP * accuracy);
    return xp;
}
function calculateLevel(totalXP) {
    return Math.floor(totalXP / 500) + 1;
}
function calculateCoins(score, total) {
    if (score === total)
        return 20;
    return 10;
}
function calculateDiamonds(score, total, difficulty) {
    if (difficulty === "hard" && score === total)
        return 5;
    return 0;
}
function updateStreak(lastActiveDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (!lastActiveDate)
        return { newStreak: 1, today };
    if (lastActiveDate === today) {
        return { newStreak: null, today };
    }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastActiveDate === yesterday) {
        return { increment: true, today };
    }
    return { reset: true, today };
}