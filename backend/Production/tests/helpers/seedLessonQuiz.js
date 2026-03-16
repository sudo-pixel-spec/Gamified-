"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedLessonWithQuiz = seedLessonWithQuiz;
const Standard_1 = require("../../src/models/Standard");
const Subject_1 = require("../../src/models/Subject");
const Unit_1 = require("../../src/models/Unit");
const Chapter_1 = require("../../src/models/Chapter");
const Lesson_1 = require("../../src/models/Lesson");
const Quiz_1 = require("../../src/models/Quiz");
async function seedLessonWithQuiz(difficulty = "medium") {
    const std8 = await Standard_1.Standard.create({ code: "CBSE_STD_8", name: "Std 8", active: true });
    const subject = await Subject_1.Subject.create({ standardId: std8._id, name: "Science", orderIndex: 1 });
    const unit = await Unit_1.Unit.create({ subjectId: subject._id, name: "Unit 1", orderIndex: 1 });
    const chapter = await Chapter_1.Chapter.create({ unitId: unit._id, name: "Chapter 1", orderIndex: 1 });
    const lesson = await Lesson_1.Lesson.create({
        chapterId: chapter._id,
        title: "Photosynthesis Basics",
        orderIndex: 1,
        videoUrl: "https://example.com/video",
        bullets: ["A", "B"],
        contentText: "Photosynthesis content"
    });
    const quiz = await Quiz_1.Quiz.create({
        lessonId: lesson._id,
        version: 1,
        source: "seed",
        difficulty,
        published: true,
        questions: [
            { qid: "q1", prompt: "Q1", options: ["a", "b", "c", "d"], answerIndex: 0, explanation: "E1" },
            { qid: "q2", prompt: "Q2", options: ["a", "b", "c", "d"], answerIndex: 1, explanation: "E2" },
            { qid: "q3", prompt: "Q3", options: ["a", "b", "c", "d"], answerIndex: 2, explanation: "E3" }
        ]
    });
    return { std8, subject, unit, chapter, lesson, quiz };
}