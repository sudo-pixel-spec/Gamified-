// Type declarations for lib/admin-api.js
// Keeps LessonVideoPanel.tsx (and any future .tsx files) happy
// without converting the JS module to TypeScript.

type ApiResponse = Promise<unknown>;
type Body = Record<string, unknown>;

// Standards
export declare function listStandards(): ApiResponse;
export declare function createStandard(body: Body): ApiResponse;
export declare function updateStandard(id: string, body: Body): ApiResponse;
export declare function deleteStandard(id: string): ApiResponse;
export declare function restoreStandard(id: string): ApiResponse;

// Subjects
export declare function listSubjects(): ApiResponse;
export declare function createSubject(body: Body): ApiResponse;
export declare function updateSubject(id: string, body: Body): ApiResponse;
export declare function deleteSubject(id: string): ApiResponse;
export declare function restoreSubject(id: string): ApiResponse;

// Units
export declare function listUnits(): ApiResponse;
export declare function createUnit(body: Body): ApiResponse;
export declare function updateUnit(id: string, body: Body): ApiResponse;
export declare function deleteUnit(id: string): ApiResponse;
export declare function restoreUnit(id: string): ApiResponse;

// Chapters
export declare function listChapters(): ApiResponse;
export declare function createChapter(body: Body): ApiResponse;
export declare function updateChapter(id: string, body: Body): ApiResponse;
export declare function deleteChapter(id: string): ApiResponse;
export declare function restoreChapter(id: string): ApiResponse;

// Lessons
export declare function listLessons(): ApiResponse;
export declare function createLesson(body: Body): ApiResponse;
export declare function updateLesson(id: string, body: Body): ApiResponse;
export declare function deleteLesson(id: string): ApiResponse;
export declare function restoreLesson(id: string): ApiResponse;

// Quizzes
export declare function getLatestQuizForLesson(lessonId: string): ApiResponse;
export declare function createQuizVersion(body: Body): ApiResponse;
export declare function setQuizPublished(id: string, body: Body): ApiResponse;
export declare function publishQuizExclusive(id: string): ApiResponse;
export declare function restoreQuiz(id: string): ApiResponse;

// Jobs
export declare function getJobsStatus(): ApiResponse;
