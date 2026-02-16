import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";

import { Standard } from "../models/Standard";
import { Subject } from "../models/Subject";
import { Unit } from "../models/Unit";
import { Chapter } from "../models/Chapter";
import { Lesson } from "../models/Lesson";
import { Quiz } from "../models/Quiz";
import { Attempt } from "../models/Attempt";

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

const IdParam = z.object({ id: z.string().min(1) });

const StandardCreate = z.object({
  code: z.string().min(3),
  name: z.string().min(2),
  active: z.boolean().optional(),
});

const StandardUpdate = z.object({
  code: z.string().min(3).optional(),
  name: z.string().min(2).optional(),
  active: z.boolean().optional(),
});

export async function listStandards(req: Request, res: Response) {
  const { limit, skip, page } = parsePaging(req);

  const filter: any = {};
  const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
  if (!includeDeleted) filter.deletedAt = null;

  const [items, total] = await Promise.all([
    Standard.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Standard.countDocuments(filter),
  ]);
  return res.json(ok({ page, limit, total, items }));
}

export async function createStandard(req: Request, res: Response) {
  const parsed = StandardCreate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));
  const created = await Standard.create(parsed.data);
  return res.status(201).json(ok(created));
}

export async function updateStandard(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));
  const parsed = StandardUpdate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const updated = await Standard.findByIdAndUpdate(p.data.id, parsed.data, {
    new: true,
  }).lean();
  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Standard not found"));
  return res.json(ok(updated));
}

export async function deleteStandard(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const subjectCount = await Subject.countDocuments({
    standardId: p.data.id,
    deletedAt: null,
  });
  if (subjectCount > 0) {
    return res
      .status(409)
      .json(
        fail(
          "HAS_CHILDREN",
          "Cannot delete standard with existing subjects",
          { subjectCount }
        )
      );
  }

  const adminId = (req as any).user?.id ?? null;

  const updated = await Standard.findByIdAndUpdate(
    p.data.id,
    { deletedAt: new Date(), deletedBy: adminId },
    { new: true }
  ).lean();

  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Standard not found"));
  return res.json(ok({ deleted: true }));
}

const SubjectCreate = z.object({
  standardId: z.string().min(1),
  name: z.string().min(2),
  orderIndex: z.number().optional(),
});
const SubjectUpdate = z.object({
  standardId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  orderIndex: z.number().optional(),
});

export async function listSubjects(req: Request, res: Response) {
  const { limit, skip, page } = parsePaging(req);
  const filter: any = {};
  if (req.query.standardId) filter.standardId = req.query.standardId;

  const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
  if (!includeDeleted) filter.deletedAt = null;

  const [items, total] = await Promise.all([
    Subject.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit).lean(),
    Subject.countDocuments(filter),
  ]);

  return res.json(ok({ page, limit, total, items }));
}

export async function createSubject(req: Request, res: Response) {
  const parsed = SubjectCreate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));
  const created = await Subject.create(parsed.data);
  return res.status(201).json(ok(created));
}

export async function updateSubject(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));
  const parsed = SubjectUpdate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const updated = await Subject.findByIdAndUpdate(p.data.id, parsed.data, {
    new: true,
  }).lean();
  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Subject not found"));
  return res.json(ok(updated));
}

export async function deleteSubject(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const unitCount = await Unit.countDocuments({
    subjectId: p.data.id,
    deletedAt: null,
  });
  if (unitCount > 0) {
    return res
      .status(409)
      .json(
        fail(
          "HAS_CHILDREN",
          "Cannot delete subject with existing units",
          { unitCount }
        )
      );
  }

  const adminId = (req as any).user?.id ?? null;

  const updated = await Subject.findByIdAndUpdate(
    p.data.id,
    { deletedAt: new Date(), deletedBy: adminId },
    { new: true }
  ).lean();

  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Subject not found"));
  return res.json(ok({ deleted: true }));
}

const UnitCreate = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(2),
  orderIndex: z.number().optional(),
});
const UnitUpdate = z.object({
  subjectId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  orderIndex: z.number().optional(),
});

export async function listUnits(req: Request, res: Response) {
  const { limit, skip, page } = parsePaging(req);
  const filter: any = {};
  if (req.query.subjectId) filter.subjectId = req.query.subjectId;

  const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
  if (!includeDeleted) filter.deletedAt = null;

  const [items, total] = await Promise.all([
    Unit.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit).lean(),
    Unit.countDocuments(filter),
  ]);

  return res.json(ok({ page, limit, total, items }));
}

export async function createUnit(req: Request, res: Response) {
  const parsed = UnitCreate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));
  const created = await Unit.create(parsed.data);
  return res.status(201).json(ok(created));
}

export async function updateUnit(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));
  const parsed = UnitUpdate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const updated = await Unit.findByIdAndUpdate(p.data.id, parsed.data, {
    new: true,
  }).lean();
  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Unit not found"));
  return res.json(ok(updated));
}

export async function deleteUnit(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const chapterCount = await Chapter.countDocuments({
    unitId: p.data.id,
    deletedAt: null,
  });
  if (chapterCount > 0) {
    return res
      .status(409)
      .json(
        fail(
          "HAS_CHILDREN",
          "Cannot delete unit with existing chapters",
          { chapterCount }
        )
      );
  }

  const adminId = (req as any).user?.id ?? null;

  const updated = await Unit.findByIdAndUpdate(
    p.data.id,
    { deletedAt: new Date(), deletedBy: adminId },
    { new: true }
  ).lean();

  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Unit not found"));
  return res.json(ok({ deleted: true }));
}

const ChapterCreate = z.object({
  unitId: z.string().min(1),
  name: z.string().min(2),
  orderIndex: z.number().optional(),
});
const ChapterUpdate = z.object({
  unitId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  orderIndex: z.number().optional(),
});

export async function listChapters(req: Request, res: Response) {
  const { limit, skip, page } = parsePaging(req);
  const filter: any = {};
  if (req.query.unitId) filter.unitId = req.query.unitId;

  const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
  if (!includeDeleted) filter.deletedAt = null;

  const [items, total] = await Promise.all([
    Chapter.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit).lean(),
    Chapter.countDocuments(filter),
  ]);

  return res.json(ok({ page, limit, total, items }));
}

export async function createChapter(req: Request, res: Response) {
  const parsed = ChapterCreate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));
  const created = await Chapter.create(parsed.data);
  return res.status(201).json(ok(created));
}

export async function updateChapter(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));
  const parsed = ChapterUpdate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const updated = await Chapter.findByIdAndUpdate(p.data.id, parsed.data, {
    new: true,
  }).lean();
  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Chapter not found"));
  return res.json(ok(updated));
}

export async function deleteChapter(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const lessonCount = await Lesson.countDocuments({
    chapterId: p.data.id,
    deletedAt: null,
  });
  if (lessonCount > 0) {
    return res
      .status(409)
      .json(
        fail(
          "HAS_CHILDREN",
          "Cannot delete chapter with existing lessons",
          { lessonCount }
        )
      );
  }

  const adminId = (req as any).user?.id ?? null;

  const updated = await Chapter.findByIdAndUpdate(
    p.data.id,
    { deletedAt: new Date(), deletedBy: adminId },
    { new: true }
  ).lean();

  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Chapter not found"));
  return res.json(ok({ deleted: true }));
}

const LessonCreate = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(2),
  orderIndex: z.number().optional(),
  videoUrl: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  contentText: z.string().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});
const LessonUpdate = LessonCreate.partial()
  .omit({ chapterId: true })
  .extend({
    chapterId: z.string().min(1).optional(),
  });

export async function listLessons(req: Request, res: Response) {
  const { limit, skip, page } = parsePaging(req);
  const filter: any = {};
  if (req.query.chapterId) filter.chapterId = req.query.chapterId;
  if (typeof req.query.published === "string")
    filter.published = req.query.published === "true";

  const includeDeleted = String(req.query.includeDeleted ?? "false") === "true";
  if (!includeDeleted) filter.deletedAt = null;

  const [items, total] = await Promise.all([
    Lesson.find(filter).sort({ orderIndex: 1 }).skip(skip).limit(limit).lean(),
    Lesson.countDocuments(filter),
  ]);

  return res.json(ok({ page, limit, total, items }));
}

export async function createLesson(req: Request, res: Response) {
  const parsed = LessonCreate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));
  const created = await Lesson.create(parsed.data);
  return res.status(201).json(ok(created));
}

export async function updateLesson(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const parsed = LessonUpdate.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const updated = await Lesson.findByIdAndUpdate(p.data.id, parsed.data, {
    new: true,
  }).lean();
  if (!updated)
    return res.status(404).json(fail("NOT_FOUND", "Lesson not found"));
  return res.json(ok(updated));
}

export async function deleteLesson(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const [attemptCount, quizCount] = await Promise.all([
    Attempt.countDocuments({ lessonId: p.data.id }),
    Quiz.countDocuments({ lessonId: p.data.id, deletedAt: null }),
  ]);

  if (attemptCount > 0 || quizCount > 0) {
    return res.status(409).json(
      fail("HAS_CHILDREN", "Cannot delete lesson with existing attempts/quizzes", {
        attemptCount,
        quizCount,
      })
    );
  }

  const adminId = (req as any).user?.id ?? null;

  const updated = await Lesson.findByIdAndUpdate(
    p.data.id,
    { deletedAt: new Date(), deletedBy: adminId },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Lesson not found"));
  return res.json(ok({ deleted: true }));
}

const QuestionSchema = z.object({
  qid: z.string().min(1),
  prompt: z.string().min(2),
  options: z.array(z.string().min(1)).min(2),
  answerIndex: z.number().int().min(0),
  explanation: z.string().optional(),
});

const CreateQuizVersionSchema = z.object({
  lessonId: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  source: z.enum(["seed", "ai"]).optional(),
  published: z.boolean().optional(),
  questions: z.array(QuestionSchema).min(1),
});

export async function getLatestQuizForLesson(req: Request, res: Response) {
  const lessonId = String(req.query.lessonId ?? "");
  if (!lessonId)
    return res.status(400).json(fail("VALIDATION", "lessonId is required"));

  const quiz = await Quiz.findOne({ lessonId }).sort({ version: -1 }).lean();
  if (!quiz) return res.status(404).json(fail("NOT_FOUND", "No quiz for lesson"));
  return res.json(ok(quiz));
}

export async function createQuizVersion(req: Request, res: Response) {
  const parsed = CreateQuizVersionSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const { lessonId, questions, difficulty, source, published } = parsed.data;

  const latest = await Quiz.findOne({ lessonId }).sort({ version: -1 }).lean();
  const nextVersion = latest ? (latest.version ?? 0) + 1 : 1;

  for (const q of questions) {
    if (q.answerIndex >= q.options.length) {
      return res
        .status(400)
        .json(fail("VALIDATION", `answerIndex out of range for qid=${q.qid}`));
    }
  }

  const created = await Quiz.create({
    lessonId,
    version: nextVersion,
    difficulty: difficulty ?? "medium",
    source: source ?? "seed",
    published: published ?? false,
    questions,
  });

  return res.status(201).json(ok(created));
}

const SetPublishedSchema = z.object({ published: z.boolean() });

export async function setQuizPublished(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));
  const parsed = SetPublishedSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const updated = await Quiz.findByIdAndUpdate(
    p.data.id,
    { published: parsed.data.published },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Quiz not found"));
  return res.json(ok(updated));
}

export async function publishQuizExclusive(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success)
    return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const quiz = await Quiz.findById(p.data.id);
  if (!quiz) return res.status(404).json(fail("NOT_FOUND", "Quiz not found"));

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Quiz.updateMany(
        { lessonId: quiz.lessonId },
        { $set: { published: false } },
        { session }
      );

      await Quiz.updateOne(
        { _id: quiz._id },
        { $set: { published: true } },
        { session }
      );
    });

    const updated = await Quiz.findById(quiz._id).lean();
    return res.json(ok(updated));
  } finally {
    session.endSession();
  }
}

export async function restoreStandard(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const updated = await Standard.findByIdAndUpdate(
    p.data.id,
    { deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Standard not found"));
  return res.json(ok(updated));
}

export async function restoreSubject(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const updated = await Subject.findByIdAndUpdate(
    p.data.id,
    { deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Subject not found"));
  return res.json(ok(updated));
}

export async function restoreUnit(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const updated = await Unit.findByIdAndUpdate(
    p.data.id,
    { deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Unit not found"));
  return res.json(ok(updated));
}

export async function restoreChapter(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const updated = await Chapter.findByIdAndUpdate(
    p.data.id,
    { deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Chapter not found"));
  return res.json(ok(updated));
}

export async function restoreLesson(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const updated = await Lesson.findByIdAndUpdate(
    p.data.id,
    { deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Lesson not found"));
  return res.json(ok(updated));
}

export async function restoreQuiz(req: Request, res: Response) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return res.status(400).json(fail("VALIDATION", "Invalid id"));

  const updated = await Quiz.findByIdAndUpdate(
    p.data.id,
    { deletedAt: null, deletedBy: null },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json(fail("NOT_FOUND", "Quiz not found"));
  return res.json(ok(updated));
}
