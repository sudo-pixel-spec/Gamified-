"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsStatus = jobsStatus;
exports.listStandards = listStandards;
exports.createStandard = createStandard;
exports.updateStandard = updateStandard;
exports.deleteStandard = deleteStandard;
exports.listSubjects = listSubjects;
exports.createSubject = createSubject;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
exports.listUnits = listUnits;
exports.createUnit = createUnit;
exports.updateUnit = updateUnit;
exports.deleteUnit = deleteUnit;
exports.listChapters = listChapters;
exports.createChapter = createChapter;
exports.updateChapter = updateChapter;
exports.deleteChapter = deleteChapter;
exports.listLessons = listLessons;
exports.createLesson = createLesson;
exports.updateLesson = updateLesson;
exports.deleteLesson = deleteLesson;
exports.getLatestQuizForLesson = getLatestQuizForLesson;
exports.createQuizVersion = createQuizVersion;
exports.setQuizPublished = setQuizPublished;
exports.publishQuizExclusive = publishQuizExclusive;
exports.restoreStandard = restoreStandard;
exports.restoreSubject = restoreSubject;
exports.restoreUnit = restoreUnit;
exports.restoreChapter = restoreChapter;
exports.restoreLesson = restoreLesson;
exports.restoreQuiz = restoreQuiz;
exports.listAdminAuditLogs = listAdminAuditLogs;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const Standard_1 = require("../models/Standard");
const Subject_1 = require("../models/Subject");
const Unit_1 = require("../models/Unit");
const Chapter_1 = require("../models/Chapter");
const Lesson_1 = require("../models/Lesson");
const Quiz_1 = require("../models/Quiz");
const Attempt_1 = require("../models/Attempt");
const adminAudit_1 = require("../services/adminAudit");
const AdminAuditLog_1 = require("../models/AdminAuditLog");
function parsePaging(req) {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
const IdParam = zod_1.z.object({ id: zod_1.z.string().min(1) });
const StandardCreate = zod_1.z.object({
    code: zod_1.z.string().min(3),
    name: zod_1.z.string().min(2),
    active: zod_1.z.boolean().optional(),
});
const StandardUpdate = zod_1.z.object({
    code: zod_1.z.string().min(3).optional(),
    name: zod_1.z.string().min(2).optional(),
    active: zod_1.z.boolean().optional(),
});
async function jobsStatus(req, res) {
    if (process.env.JOBS_ENABLED !== "true") {
        return res.json((0, apiResponse_1.ok)({ enabled: false }));
    }
    try {
        const { getAgenda } = await import("../jobs/agendaDriver.js");
        const agenda = await getAgenda();
        return res.json((0, apiResponse_1.ok)({ enabled: true, name: agenda._name || "agenda" }));
    }
    catch {
        return res.status(500).json((0, apiResponse_1.fail)("JOBS_NOT_READY", "Jobs enabled but agenda not initialized"));
    }
}
async function listStandards(req, res) {
    const { limit, skip, page } = parsePaging(req);
    const filter = {};
    const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
    if (!includeDeleted)
        filter.deletedAt = null;
    const q = Standard_1.Standard.find(filter).sort({ name: 1 }).skip(skip).limit(limit);
    if (includeDeleted)
        q.setOptions({ includeDeleted: true });
    const [items, total] = await Promise.all([
        q.lean(),
        includeDeleted
            ? Standard_1.Standard.countDocuments(filter).setOptions({ includeDeleted: true })
            : Standard_1.Standard.countDocuments(filter),
    ]);
    return res.json((0, apiResponse_1.ok)({ page, limit, total, items }));
}
async function createStandard(req, res) {
    const parsed = StandardCreate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const created = await Standard_1.Standard.create(parsed.data);
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "CREATE",
        entity: "Standard",
        entityId: created._id,
        payload: parsed.data,
    });
    return res.status(201).json((0, apiResponse_1.ok)(created));
}
async function updateStandard(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const parsed = StandardUpdate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const updated = await Standard_1.Standard.findByIdAndUpdate(p.data.id, parsed.data, {
        new: true,
    }).lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Standard not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "UPDATE",
        entity: "Standard",
        entityId: updated._id,
        payload: parsed.data,
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function deleteStandard(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const subjectCount = await Subject_1.Subject.countDocuments({
        standardId: p.data.id,
        deletedAt: null,
    });
    if (subjectCount > 0) {
        return res
            .status(409)
            .json((0, apiResponse_1.fail)("HAS_CHILDREN", "Cannot delete standard with existing subjects", { subjectCount }));
    }
    const adminId = req.user?.id ?? null;
    const updated = await Standard_1.Standard.findByIdAndUpdate(p.data.id, { deletedAt: new Date(), deletedBy: adminId }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Standard not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "DELETE",
        entity: "Standard",
        entityId: updated._id,
        payload: { deletedAt: updated.deletedAt, deletedBy: updated.deletedBy },
    });
    return res.json((0, apiResponse_1.ok)({ deleted: true }));
}
const SubjectCreate = zod_1.z.object({
    standardId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    orderIndex: zod_1.z.number().optional(),
});
const SubjectUpdate = zod_1.z.object({
    standardId: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(2).optional(),
    orderIndex: zod_1.z.number().optional(),
});
async function listSubjects(req, res) {
    const { limit, skip, page } = parsePaging(req);
    const filter = {};
    if (req.query.standardId)
        filter.standardId = req.query.standardId;
    const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
    if (!includeDeleted)
        filter.deletedAt = null;
    const q = Subject_1.Subject.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit);
    if (includeDeleted)
        q.setOptions({ includeDeleted: true });
    const [items, total] = await Promise.all([
        q.lean(),
        includeDeleted
            ? Subject_1.Subject.countDocuments(filter).setOptions({ includeDeleted: true })
            : Subject_1.Subject.countDocuments(filter),
    ]);
    return res.json((0, apiResponse_1.ok)({ page, limit, total, items }));
}
async function createSubject(req, res) {
    const parsed = SubjectCreate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const created = await Subject_1.Subject.create(parsed.data);
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "CREATE",
        entity: "Subject",
        entityId: created._id,
        payload: parsed.data,
    });
    return res.status(201).json((0, apiResponse_1.ok)(created));
}
async function updateSubject(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const parsed = SubjectUpdate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const updated = await Subject_1.Subject.findByIdAndUpdate(p.data.id, parsed.data, {
        new: true,
    }).lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Subject not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "UPDATE",
        entity: "Subject",
        entityId: updated._id,
        payload: parsed.data,
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function deleteSubject(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const unitCount = await Unit_1.Unit.countDocuments({
        subjectId: p.data.id,
        deletedAt: null,
    });
    if (unitCount > 0) {
        return res
            .status(409)
            .json((0, apiResponse_1.fail)("HAS_CHILDREN", "Cannot delete subject with existing units", { unitCount }));
    }
    const adminId = req.user?.id ?? null;
    const updated = await Subject_1.Subject.findByIdAndUpdate(p.data.id, { deletedAt: new Date(), deletedBy: adminId }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Subject not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "DELETE",
        entity: "Subject",
        entityId: updated._id,
        payload: { deletedAt: updated.deletedAt, deletedBy: updated.deletedBy },
    });
    return res.json((0, apiResponse_1.ok)({ deleted: true }));
}
const UnitCreate = zod_1.z.object({
    subjectId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    orderIndex: zod_1.z.number().optional(),
});
const UnitUpdate = zod_1.z.object({
    subjectId: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(2).optional(),
    orderIndex: zod_1.z.number().optional(),
});
async function listUnits(req, res) {
    const { limit, skip, page } = parsePaging(req);
    const filter = {};
    if (req.query.subjectId)
        filter.subjectId = req.query.subjectId;
    const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
    if (!includeDeleted)
        filter.deletedAt = null;
    const q = Unit_1.Unit.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit);
    if (includeDeleted)
        q.setOptions({ includeDeleted: true });
    const [items, total] = await Promise.all([
        q.lean(),
        includeDeleted
            ? Unit_1.Unit.countDocuments(filter).setOptions({ includeDeleted: true })
            : Unit_1.Unit.countDocuments(filter),
    ]);
    return res.json((0, apiResponse_1.ok)({ page, limit, total, items }));
}
async function createUnit(req, res) {
    const parsed = UnitCreate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const created = await Unit_1.Unit.create(parsed.data);
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "CREATE",
        entity: "Unit",
        entityId: created._id,
        payload: parsed.data,
    });
    return res.status(201).json((0, apiResponse_1.ok)(created));
}
async function updateUnit(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const parsed = UnitUpdate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const updated = await Unit_1.Unit.findByIdAndUpdate(p.data.id, parsed.data, {
        new: true,
    }).lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Unit not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "UPDATE",
        entity: "Unit",
        entityId: updated._id,
        payload: parsed.data,
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function deleteUnit(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const chapterCount = await Chapter_1.Chapter.countDocuments({
        unitId: p.data.id,
        deletedAt: null,
    });
    if (chapterCount > 0) {
        return res
            .status(409)
            .json((0, apiResponse_1.fail)("HAS_CHILDREN", "Cannot delete unit with existing chapters", { chapterCount }));
    }
    const adminId = req.user?.id ?? null;
    const updated = await Unit_1.Unit.findByIdAndUpdate(p.data.id, { deletedAt: new Date(), deletedBy: adminId }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Unit not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "DELETE",
        entity: "Unit",
        entityId: updated._id,
        payload: { deletedAt: updated.deletedAt, deletedBy: updated.deletedBy },
    });
    return res.json((0, apiResponse_1.ok)({ deleted: true }));
}
const ChapterCreate = zod_1.z.object({
    unitId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    orderIndex: zod_1.z.number().optional(),
});
const ChapterUpdate = zod_1.z.object({
    unitId: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(2).optional(),
    orderIndex: zod_1.z.number().optional(),
});
async function listChapters(req, res) {
    const { limit, skip, page } = parsePaging(req);
    const filter = {};
    if (req.query.unitId)
        filter.unitId = req.query.unitId;
    const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
    if (!includeDeleted)
        filter.deletedAt = null;
    const q = Chapter_1.Chapter.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit);
    if (includeDeleted)
        q.setOptions({ includeDeleted: true });
    const [items, total] = await Promise.all([
        q.lean(),
        includeDeleted
            ? Chapter_1.Chapter.countDocuments(filter).setOptions({ includeDeleted: true })
            : Chapter_1.Chapter.countDocuments(filter),
    ]);
    return res.json((0, apiResponse_1.ok)({ page, limit, total, items }));
}
async function createChapter(req, res) {
    const parsed = ChapterCreate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const created = await Chapter_1.Chapter.create(parsed.data);
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "CREATE",
        entity: "Chapter",
        entityId: created._id,
        payload: parsed.data,
    });
    return res.status(201).json((0, apiResponse_1.ok)(created));
}
async function updateChapter(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const parsed = ChapterUpdate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const updated = await Chapter_1.Chapter.findByIdAndUpdate(p.data.id, parsed.data, {
        new: true,
    }).lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Chapter not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "UPDATE",
        entity: "Chapter",
        entityId: updated._id,
        payload: parsed.data,
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function deleteChapter(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const lessonCount = await Lesson_1.Lesson.countDocuments({
        chapterId: p.data.id,
        deletedAt: null,
    });
    if (lessonCount > 0) {
        return res
            .status(409)
            .json((0, apiResponse_1.fail)("HAS_CHILDREN", "Cannot delete chapter with existing lessons", { lessonCount }));
    }
    const adminId = req.user?.id ?? null;
    const updated = await Chapter_1.Chapter.findByIdAndUpdate(p.data.id, { deletedAt: new Date(), deletedBy: adminId }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Chapter not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "DELETE",
        entity: "Chapter",
        entityId: updated._id,
        payload: { deletedAt: updated.deletedAt, deletedBy: updated.deletedBy },
    });
    return res.json((0, apiResponse_1.ok)({ deleted: true }));
}
const LessonCreate = zod_1.z.object({
    chapterId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(2),
    orderIndex: zod_1.z.number().optional(),
    videoUrl: zod_1.z.string().optional(),
    bullets: zod_1.z.array(zod_1.z.string()).optional(),
    contentText: zod_1.z.string().optional(),
    published: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const LessonUpdate = LessonCreate.partial()
    .omit({ chapterId: true })
    .extend({
    chapterId: zod_1.z.string().min(1).optional(),
});
async function listLessons(req, res) {
    const { limit, skip, page } = parsePaging(req);
    const filter = {};
    if (req.query.chapterId)
        filter.chapterId = req.query.chapterId;
    if (typeof req.query.published === "string")
        filter.published = req.query.published === "true";
    const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
    if (!includeDeleted)
        filter.deletedAt = null;
    const q = Lesson_1.Lesson.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit);
    if (includeDeleted)
        q.setOptions({ includeDeleted: true });
    const [items, total] = await Promise.all([
        q.lean(),
        includeDeleted
            ? Lesson_1.Lesson.countDocuments(filter).setOptions({ includeDeleted: true })
            : Lesson_1.Lesson.countDocuments(filter),
    ]);
    return res.json((0, apiResponse_1.ok)({ page, limit, total, items }));
}
async function createLesson(req, res) {
    const parsed = LessonCreate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const created = await Lesson_1.Lesson.create(parsed.data);
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "CREATE",
        entity: "Lesson",
        entityId: created._id,
        payload: { chapterId: parsed.data.chapterId, title: parsed.data.title, orderIndex: parsed.data.orderIndex },
    });
    return res.status(201).json((0, apiResponse_1.ok)(created));
}
async function updateLesson(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const parsed = LessonUpdate.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const updated = await Lesson_1.Lesson.findByIdAndUpdate(p.data.id, parsed.data, {
        new: true,
    }).lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Lesson not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "UPDATE",
        entity: "Lesson",
        entityId: updated._id,
        payload: parsed.data,
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function deleteLesson(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const [attemptCount, quizCount] = await Promise.all([
        Attempt_1.Attempt.countDocuments({ lessonId: p.data.id }),
        Quiz_1.Quiz.countDocuments({ lessonId: p.data.id, deletedAt: null }),
    ]);
    if (attemptCount > 0 || quizCount > 0) {
        return res.status(409).json((0, apiResponse_1.fail)("HAS_CHILDREN", "Cannot delete lesson with existing attempts/quizzes", {
            attemptCount,
            quizCount,
        }));
    }
    const adminId = req.user?.id ?? null;
    const updated = await Lesson_1.Lesson.findByIdAndUpdate(p.data.id, { deletedAt: new Date(), deletedBy: adminId }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Lesson not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "DELETE",
        entity: "Lesson",
        entityId: updated._id,
        payload: { deletedAt: updated.deletedAt, deletedBy: updated.deletedBy },
    });
    return res.json((0, apiResponse_1.ok)({ deleted: true }));
}
const QuestionSchema = zod_1.z.object({
    qid: zod_1.z.string().min(1),
    prompt: zod_1.z.string().min(2),
    options: zod_1.z.array(zod_1.z.string().min(1)).min(2),
    answerIndex: zod_1.z.number().int().min(0),
    explanation: zod_1.z.string().optional(),
});
const CreateQuizVersionSchema = zod_1.z.object({
    lessonId: zod_1.z.string().min(1),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]).optional(),
    source: zod_1.z.enum(["seed", "ai"]).optional(),
    published: zod_1.z.boolean().optional(),
    questions: zod_1.z.array(QuestionSchema).min(1),
});
async function getLatestQuizForLesson(req, res) {
    const lessonId = String(req.query.lessonId ?? "");
    if (!lessonId)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "lessonId is required"));
    const quiz = await Quiz_1.Quiz.findOne({ lessonId }).sort({ version: -1 }).lean();
    if (!quiz)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "No quiz for lesson"));
    return res.json((0, apiResponse_1.ok)(quiz));
}
async function createQuizVersion(req, res) {
    const parsed = CreateQuizVersionSchema.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const { lessonId, questions, difficulty, source, published } = parsed.data;
    const latest = await Quiz_1.Quiz.findOne({ lessonId }).sort({ version: -1 }).lean();
    const nextVersion = latest ? (latest.version ?? 0) + 1 : 1;
    for (const q of questions) {
        if (q.answerIndex >= q.options.length) {
            return res
                .status(400)
                .json((0, apiResponse_1.fail)("VALIDATION", `answerIndex out of range for qid=${q.qid}`));
        }
    }
    const created = await Quiz_1.Quiz.create({
        lessonId,
        version: nextVersion,
        difficulty: difficulty ?? "medium",
        source: source ?? "seed",
        published: published ?? false,
        questions,
    });
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "CREATE",
        entity: "Quiz",
        entityId: created._id,
        payload: {
            lessonId,
            version: nextVersion,
            difficulty: difficulty ?? "medium",
            source: source ?? "seed",
            published: published ?? false,
            questionCount: questions.length,
        },
    });
    return res.status(201).json((0, apiResponse_1.ok)(created));
}
const SetPublishedSchema = zod_1.z.object({ published: zod_1.z.boolean() });
async function setQuizPublished(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const parsed = SetPublishedSchema.safeParse(req.body);
    if (!parsed.success)
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const updated = await Quiz_1.Quiz.findByIdAndUpdate(p.data.id, { published: parsed.data.published }, { new: true }).lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Quiz not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "PUBLISH",
        entity: "Quiz",
        entityId: updated._id,
        payload: { published: parsed.data.published },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function publishQuizExclusive(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const quiz = await Quiz_1.Quiz.findById(p.data.id);
    if (!quiz)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Quiz not found"));
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            await Quiz_1.Quiz.updateMany({ lessonId: quiz.lessonId }, { $set: { published: false } }, { session });
            await Quiz_1.Quiz.updateOne({ _id: quiz._id }, { $set: { published: true } }, { session });
        });
        const updated = await Quiz_1.Quiz.findById(quiz._id).lean();
        await (0, adminAudit_1.writeAdminAudit)(req, {
            action: "PUBLISH",
            entity: "Quiz",
            entityId: quiz._id,
            payload: { mode: "exclusive", lessonId: quiz.lessonId, published: true },
        });
        return res.json((0, apiResponse_1.ok)(updated));
    }
    finally {
        session.endSession();
    }
}
async function restoreStandard(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const updated = await Standard_1.Standard.findByIdAndUpdate(p.data.id, { deletedAt: null, deletedBy: null }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Standard not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "RESTORE",
        entity: "Standard",
        entityId: updated._id,
        payload: { restored: true },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function restoreSubject(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const updated = await Subject_1.Subject.findByIdAndUpdate(p.data.id, { deletedAt: null, deletedBy: null }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Subject not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "RESTORE",
        entity: "Subject",
        entityId: updated._id,
        payload: { restored: true },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function restoreUnit(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const updated = await Unit_1.Unit.findByIdAndUpdate(p.data.id, { deletedAt: null, deletedBy: null }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Unit not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "RESTORE",
        entity: "Unit",
        entityId: updated._id,
        payload: { restored: true },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function restoreChapter(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const updated = await Chapter_1.Chapter.findByIdAndUpdate(p.data.id, { deletedAt: null, deletedBy: null }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Chapter not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "RESTORE",
        entity: "Chapter",
        entityId: updated._id,
        payload: { restored: true },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function restoreLesson(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const updated = await Lesson_1.Lesson.findByIdAndUpdate(p.data.id, { deletedAt: null, deletedBy: null }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Lesson not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "RESTORE",
        entity: "Lesson",
        entityId: updated._id,
        payload: { restored: true },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
async function restoreQuiz(req, res) {
    const p = IdParam.safeParse(req.params);
    if (!p.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid id"));
    const updated = await Quiz_1.Quiz.findByIdAndUpdate(p.data.id, { deletedAt: null, deletedBy: null }, { new: true })
        .setOptions({ includeDeleted: true })
        .lean();
    if (!updated)
        return res.status(404).json((0, apiResponse_1.fail)("NOT_FOUND", "Quiz not found"));
    await (0, adminAudit_1.writeAdminAudit)(req, {
        action: "RESTORE",
        entity: "Quiz",
        entityId: updated._id,
        payload: { restored: true },
    });
    return res.json((0, apiResponse_1.ok)(updated));
}
const AuditQuerySchema = zod_1.z.object({
    action: zod_1.z.string().optional(),
    entity: zod_1.z.string().optional(),
});
async function listAdminAuditLogs(req, res) {
    const { page, limit, skip } = parsePaging(req);
    const parsed = AuditQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid query params"));
    }
    const filter = {};
    if (parsed.data.action && parsed.data.action !== "ALL") {
        filter.action = parsed.data.action;
    }
    if (parsed.data.entity && parsed.data.entity !== "ALL") {
        filter.entity = parsed.data.entity;
    }
    const [items, total] = await Promise.all([
        AdminAuditLog_1.AdminAuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AdminAuditLog_1.AdminAuditLog.countDocuments(filter),
    ]);
    return res.json((0, apiResponse_1.ok)({ page, limit, total, items }));
}