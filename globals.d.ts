// Global ambient declarations so TypeScript can resolve the JS modules
// used inside .tsx components.

declare module "@/lib/admin-api" {
  type Body = Record<string, unknown>;
  type ApiResponse = Promise<unknown>;

  export function listStandards(): ApiResponse;
  export function createStandard(body: Body): ApiResponse;
  export function updateStandard(id: string, body: Body): ApiResponse;
  export function deleteStandard(id: string): ApiResponse;
  export function restoreStandard(id: string): ApiResponse;

  export function listSubjects(): ApiResponse;
  export function createSubject(body: Body): ApiResponse;
  export function updateSubject(id: string, body: Body): ApiResponse;
  export function deleteSubject(id: string): ApiResponse;
  export function restoreSubject(id: string): ApiResponse;

  export function listUnits(): ApiResponse;
  export function createUnit(body: Body): ApiResponse;
  export function updateUnit(id: string, body: Body): ApiResponse;
  export function deleteUnit(id: string): ApiResponse;
  export function restoreUnit(id: string): ApiResponse;

  export function listChapters(): ApiResponse;
  export function createChapter(body: Body): ApiResponse;
  export function updateChapter(id: string, body: Body): ApiResponse;
  export function deleteChapter(id: string): ApiResponse;
  export function restoreChapter(id: string): ApiResponse;

  export function listLessons(): ApiResponse;
  export function createLesson(body: Body): ApiResponse;
  export function updateLesson(id: string, body: Body): ApiResponse;
  export function deleteLesson(id: string): ApiResponse;
  export function restoreLesson(id: string): ApiResponse;

  export function getLatestQuizForLesson(lessonId: string): ApiResponse;
  export function createQuizVersion(body: Body): ApiResponse;
  export function setQuizPublished(id: string, body: Body): ApiResponse;
  export function publishQuizExclusive(id: string): ApiResponse;
  export function restoreQuiz(id: string): ApiResponse;

  export function getJobsStatus(): ApiResponse;
}
