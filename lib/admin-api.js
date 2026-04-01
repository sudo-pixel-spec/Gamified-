import { apiFetch } from "./api";

const BASE = "/v1/admin";

// ── Standards ──
export const listStandards = () => apiFetch(`${BASE}/standards?includeDeleted=true`);
export const createStandard = (body) => apiFetch(`${BASE}/standards`, { method: "POST", body: JSON.stringify(body) });
export const updateStandard = (id, body) => apiFetch(`${BASE}/standards/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteStandard = (id) => apiFetch(`${BASE}/standards/${id}`, { method: "DELETE" });
export const restoreStandard = (id) => apiFetch(`${BASE}/standards/${id}/restore`, { method: "PATCH" });

// ── Subjects ──
export const listSubjects = () => apiFetch(`${BASE}/subjects?includeDeleted=true`);
export const createSubject = (body) => apiFetch(`${BASE}/subjects`, { method: "POST", body: JSON.stringify(body) });
export const updateSubject = (id, body) => apiFetch(`${BASE}/subjects/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteSubject = (id) => apiFetch(`${BASE}/subjects/${id}`, { method: "DELETE" });
export const restoreSubject = (id) => apiFetch(`${BASE}/subjects/${id}/restore`, { method: "PATCH" });

// ── Units ──
export const listUnits = () => apiFetch(`${BASE}/units?includeDeleted=true`);
export const createUnit = (body) => apiFetch(`${BASE}/units`, { method: "POST", body: JSON.stringify(body) });
export const updateUnit = (id, body) => apiFetch(`${BASE}/units/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteUnit = (id) => apiFetch(`${BASE}/units/${id}`, { method: "DELETE" });
export const restoreUnit = (id) => apiFetch(`${BASE}/units/${id}/restore`, { method: "PATCH" });

// ── Chapters ──
export const listChapters = () => apiFetch(`${BASE}/chapters?includeDeleted=true`);
export const createChapter = (body) => apiFetch(`${BASE}/chapters`, { method: "POST", body: JSON.stringify(body) });
export const updateChapter = (id, body) => apiFetch(`${BASE}/chapters/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteChapter = (id) => apiFetch(`${BASE}/chapters/${id}`, { method: "DELETE" });
export const restoreChapter = (id) => apiFetch(`${BASE}/chapters/${id}/restore`, { method: "PATCH" });

// ── Lessons ──
export const listLessons = () => apiFetch(`${BASE}/lessons?includeDeleted=true&limit=500`);
export const createLesson = (body) => apiFetch(`${BASE}/lessons`, { method: "POST", body: JSON.stringify(body) });
export const updateLesson = (id, body) => apiFetch(`${BASE}/lessons/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteLesson = (id) => apiFetch(`${BASE}/lessons/${id}`, { method: "DELETE" });
export const restoreLesson = (id) => apiFetch(`${BASE}/lessons/${id}/restore`, { method: "PATCH" });

// ── Quizzes ──
export const getLatestQuizForLesson = (lessonId) => apiFetch(`${BASE}/quizzes/latest?lessonId=${encodeURIComponent(lessonId)}`);
export const createQuizVersion = (body) => apiFetch(`${BASE}/quizzes/version`, { method: "POST", body: JSON.stringify(body) });
export const setQuizPublished = (id, body) => apiFetch(`${BASE}/quizzes/${id}/published`, { method: "PATCH", body: JSON.stringify(body) });
export const publishQuizExclusive = (id) => apiFetch(`${BASE}/quizzes/${id}/publish`, { method: "PATCH" });
export const restoreQuiz = (id) => apiFetch(`${BASE}/quizzes/${id}/restore`, { method: "PATCH" });

// ── Users ──
export const listUsers = (role = "learner") => apiFetch(`${BASE}/users?role=${role}`);
export const createAdmin = (body) => apiFetch(`${BASE}/admins`, { method: "POST", body: JSON.stringify(body) });

// ── Jobs ──
export const getJobsStatus = async () => {
	try {
		return await apiFetch(`${BASE}/jobs/status`);
	} catch (err) {
		const message = String(err?.message || "");
		// Backend can return JOBS_NOT_READY when jobs are enabled but scheduler is not booted.
		if (message.includes("JOBS_NOT_READY")) {
			return [];
		}
		throw err;
	}
};
