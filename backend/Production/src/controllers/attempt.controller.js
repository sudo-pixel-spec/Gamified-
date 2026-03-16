"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitAttempt = submitAttempt;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const apiResponse_1 = require("../utils/apiResponse");
const Quiz_1 = require("../models/Quiz");
const Attempt_1 = require("../models/Attempt");
const User_1 = require("../models/User");
const WalletTransaction_1 = require("../models/WalletTransaction");
const gamification_service_1 = require("../services/gamification.service");
const UserWeeklyStats_1 = require("../models/UserWeeklyStats");
const leaderboard_service_1 = require("../services/leaderboard.service");
const weekWindow_1 = require("../services/weekWindow");
const SubmitSchema = zod_1.z.object({
    lessonId: zod_1.z.string(),
    answers: zod_1.z.array(zod_1.z.object({
        qid: zod_1.z.string(),
        selectedIndex: zod_1.z.number()
    })),
    timeSpentSec: zod_1.z.number().optional(),
    idempotencyKey: zod_1.z.string()
});
async function submitAttempt(req, res) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Not authenticated"));
    const parsed = SubmitSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const { lessonId, answers, timeSpentSec, idempotencyKey } = parsed.data;
    const existing = await Attempt_1.Attempt.findOne({ userId: req.user.id, idempotencyKey });
    if (existing) {
        return res.json((0, apiResponse_1.ok)(existing));
    }
    const quiz = await Quiz_1.Quiz.findOne({ lessonId, published: true }).sort({ version: -1 });
    if (!quiz)
        return res.status(404).json((0, apiResponse_1.fail)("QUIZ_NOT_FOUND", "No quiz for lesson"));
    let score = 0;
    const evaluated = answers.map((a) => {
        const question = quiz.questions.find((q) => q.qid === a.qid);
        const correct = question && question.answerIndex === a.selectedIndex;
        if (correct)
            score++;
        return { ...a, correct };
    });
    const xp = (0, gamification_service_1.calculateXP)(score, quiz.questions.length, quiz.difficulty);
    const coins = (0, gamification_service_1.calculateCoins)(score, quiz.questions.length);
    const diamonds = (0, gamification_service_1.calculateDiamonds)(score, quiz.questions.length, quiz.difficulty);
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await User_1.User.findById(req.user.id).session(session);
        if (!user)
            throw new Error("User not found");
        user.totalXP += xp;
        user.level = (0, gamification_service_1.calculateLevel)(user.totalXP);
        const streakResult = (0, gamification_service_1.updateStreak)(user.lastActiveDate ?? null);
        if (streakResult.newStreak)
            user.streakCount = streakResult.newStreak;
        if (streakResult.increment)
            user.streakCount += 1;
        if (streakResult.reset)
            user.streakCount = 1;
        user.lastActiveDate = streakResult.today;
        if (!user.wallet)
            user.wallet = { coins: 0, diamonds: 0 };
        user.wallet.coins += coins;
        user.wallet.diamonds += diamonds;
        await user.save({ session });
        const weekStart = (0, leaderboard_service_1.getWeekStartISO)(new Date());
        const todayISO = (0, leaderboard_service_1.getDayISO)(new Date());
        const { start, end } = (0, weekWindow_1.weekWindow)(weekStart);
        const alreadyCounted = await Attempt_1.Attempt.findOne({
            userId: user._id,
            lessonId: lessonId,
            createdAt: { $gte: start, $lt: end }
        }).session(session);
        const eligible = (timeSpentSec ?? 0) >= 20;
        const stats = await UserWeeklyStats_1.UserWeeklyStats.findOneAndUpdate({ userId: user._id, weekStart }, { $setOnInsert: { userId: user._id, weekStart } }, { upsert: true, new: true, session });
        if (stats.lastActiveDay !== todayISO) {
            stats.activeDays += 1;
            stats.lastActiveDay = todayISO;
        }
        stats.questionsAttempted += quiz.questions.length;
        stats.questionsCorrect += score;
        if (!alreadyCounted && eligible) {
            stats.lessonsCompleted += 1;
            const DAILY_CAP = 300;
            const xpToAdd = Math.min(xp, DAILY_CAP);
            stats.eligibleXP += xpToAdd;
            if (quiz.difficulty === "hard" && score === quiz.questions.length) {
                stats.hardPerfectCount += 1;
            }
        }
        await stats.save({ session });
        await Attempt_1.Attempt.create([
            {
                userId: user._id,
                lessonId,
                quizVersion: quiz.version,
                answers: evaluated,
                score,
                totalQuestions: quiz.questions.length,
                xpAwarded: xp,
                coinsAwarded: coins,
                diamondsAwarded: diamonds,
                timeSpentSec: timeSpentSec ?? null,
                idempotencyKey
            }
        ], { session });
        await WalletTransaction_1.WalletTransaction.create([
            { userId: user._id, type: "earn", currency: "coins", amount: coins, reason: "lesson_complete" },
            { userId: user._id, type: "earn", currency: "diamonds", amount: diamonds, reason: "mastery_bonus" }
        ], { session, ordered: true });
        await session.commitTransaction();
        session.endSession();
        return res.json((0, apiResponse_1.ok)({
            score,
            total: quiz.questions.length,
            xpAwarded: xp,
            coinsAwarded: coins,
            diamondsAwarded: diamonds
        }));
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}