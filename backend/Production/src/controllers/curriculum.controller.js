"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStandards = getStandards;
exports.getSubjects = getSubjects;
exports.getUnits = getUnits;
exports.getChapters = getChapters;
exports.getLessons = getLessons;
const apiResponse_1 = require("../utils/apiResponse");
const Standard_1 = require("../models/Standard");
const Subject_1 = require("../models/Subject");
const Unit_1 = require("../models/Unit");
const Chapter_1 = require("../models/Chapter");
const Lesson_1 = require("../models/Lesson");
const Attempt_1 = require("../models/Attempt");
async function getStandards(_req, res) {
    const standards = await Standard_1.Standard.find().lean();
    res.json((0, apiResponse_1.ok)(standards));
}
async function getSubjects(req, res) {
    const { standardId } = req.query;
    if (!standardId)
        return res.status(400).json((0, apiResponse_1.ok)([]));
    const subjects = await Subject_1.Subject.find({ standardId: String(standardId) }).sort({ orderIndex: 1 }).lean();
    res.json((0, apiResponse_1.ok)(subjects));
}
async function getUnits(req, res) {
    const { subjectId } = req.query;
    if (!subjectId)
        return res.status(400).json((0, apiResponse_1.ok)([]));
    const units = await Unit_1.Unit.find({ subjectId: String(subjectId) }).sort({ orderIndex: 1 }).lean();
    res.json((0, apiResponse_1.ok)(units));
}
async function getChapters(req, res) {
    const { unitId } = req.query;
    if (!unitId)
        return res.status(400).json((0, apiResponse_1.ok)([]));
    const chapters = await Chapter_1.Chapter.find({ unitId: String(unitId) }).sort({ orderIndex: 1 }).lean();
    res.json((0, apiResponse_1.ok)(chapters));
}
async function getLessons(req, res) {
    const { chapterId } = req.query;
    if (!chapterId) {
        return res.status(400).json((0, apiResponse_1.ok)([]));
    }
    const lessons = await Lesson_1.Lesson.find({ chapterId: String(chapterId) })
        .sort({ orderIndex: 1 })
        .lean();
    if (!req.user?.id) {
        return res.status(401).json((0, apiResponse_1.ok)([]));
    }
    const attempts = await Attempt_1.Attempt.find({
        userId: req.user.id,
        lessonId: { $in: lessons.map((l) => l._id) }
    }).lean();
    const completedLessonIds = new Set(attempts.map((a) => String(a.lessonId)));
    const result = lessons.map((lesson, index) => {
        const completed = completedLessonIds.has(String(lesson._id));
        const unlocked = index === 0 || completedLessonIds.has(String(lessons[index - 1]?._id));
        return {
            ...lesson,
            completed,
            unlocked
        };
    });
    res.json((0, apiResponse_1.ok)(result));
}