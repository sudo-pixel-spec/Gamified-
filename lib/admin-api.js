import { apiFetch } from "./api";

const BASE = "/v1/admin";

// ── Standards ──
// Standards list with forced maximum pagination
export const listStandards = (page = 1) => 
  apiFetch(`${BASE}/standards?includeDeleted=true&limit=1000&pageSize=1000&size=1000&per_page=1000&page=${page}`);

// Recursive helper for admin
export const fetchAllAdminStandards = async () => {
    const uniqueMap = new Map();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        try {
            const res = await listStandards(page);
            const list = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            if (list.length === 0) {
                hasMore = false;
            } else {
                list.forEach(item => {
                    const id = item._id || item.id;
                    if (id) uniqueMap.set(id, item);
                });
                if (list.length < 10) hasMore = false; 
                else page++;
            }
        } catch (e) {
            console.error("Admin recursive fetch failed", e);
            hasMore = false;
        }
        if (page > 30) break;
    }
    return Array.from(uniqueMap.values());
};
export const createStandard = (body) => apiFetch(`${BASE}/standards`, { method: "POST", body: JSON.stringify(body) });
export const updateStandard = (id, body) => apiFetch(`${BASE}/standards/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteStandard = (id) => apiFetch(`${BASE}/standards/${id}`, { method: "DELETE" });
export const restoreStandard = (id) => apiFetch(`${BASE}/standards/${id}/restore`, { method: "PATCH" });

// ── Subjects ──
export const listSubjects = (page = 1) => apiFetch(`${BASE}/subjects?includeDeleted=true&limit=1000&pageSize=1000&page=${page}`);
export const fetchAllAdminSubjects = async () => {
    const uniqueMap = new Map();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        try {
            const res = await listSubjects(page);
            const list = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            if (list.length === 0) hasMore = false;
            else {
                list.forEach(i => { const id = i._id || i.id; if (id) uniqueMap.set(id, i); });
                if (list.length < 10) hasMore = false; else page++;
            }
        } catch (e) {
            console.warn("Subjects recursive fetch failed", e);
            hasMore = false;
        }
        if (page > 50) break;
    }
    return Array.from(uniqueMap.values());
};
export const createSubject = (body) => apiFetch(`${BASE}/subjects`, { method: "POST", body: JSON.stringify(body) });
export const updateSubject = (id, body) => apiFetch(`${BASE}/subjects/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteSubject = (id) => apiFetch(`${BASE}/subjects/${id}`, { method: "DELETE" });
export const restoreSubject = (id) => apiFetch(`${BASE}/subjects/${id}/restore`, { method: "PATCH" });

// ── Units ──
export const listUnits = (page = 1) => apiFetch(`${BASE}/units?includeDeleted=true&limit=1000&pageSize=1000&page=${page}`);
export const fetchAllAdminUnits = async () => {
    const uniqueMap = new Map();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        try {
            const res = await listUnits(page);
            const list = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            if (list.length === 0) hasMore = false;
            else {
                list.forEach(i => { const id = i._id || i.id; if (id) uniqueMap.set(id, i); });
                if (list.length < 10) hasMore = false; else page++;
            }
        } catch (e) {
            console.warn("Units recursive fetch failed", e);
            hasMore = false;
        }
        if (page > 100) break;
    }
    return Array.from(uniqueMap.values());
};
export const createUnit = (body) => apiFetch(`${BASE}/units`, { method: "POST", body: JSON.stringify(body) });
export const updateUnit = (id, body) => apiFetch(`${BASE}/units/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteUnit = (id) => apiFetch(`${BASE}/units/${id}`, { method: "DELETE" });
export const restoreUnit = (id) => apiFetch(`${BASE}/units/${id}/restore`, { method: "PATCH" });

// ── Chapters ──
export const listChapters = (page = 1) => apiFetch(`${BASE}/chapters?includeDeleted=true&limit=1000&pageSize=1000&page=${page}`);
export const fetchAllAdminChapters = async () => {
    const uniqueMap = new Map();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        try {
            const res = await listChapters(page);
            const list = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            if (list.length === 0) hasMore = false;
            else {
                list.forEach(i => { const id = i._id || i.id; if (id) uniqueMap.set(id, i); });
                if (list.length < 10) hasMore = false; else page++;
            }
        } catch (e) {
            console.warn("Chapters recursive fetch failed", e);
            hasMore = false;
        }
        if (page > 200) break;
    }
    return Array.from(uniqueMap.values());
};
export const createChapter = (body) => apiFetch(`${BASE}/chapters`, { method: "POST", body: JSON.stringify(body) });
export const updateChapter = (id, body) => apiFetch(`${BASE}/chapters/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const deleteChapter = (id) => apiFetch(`${BASE}/chapters/${id}`, { method: "DELETE" });
export const restoreChapter = (id) => apiFetch(`${BASE}/chapters/${id}/restore`, { method: "PATCH" });

// ── Lessons ──
export const listLessons = (page = 1) => apiFetch(`${BASE}/lessons?includeDeleted=true&limit=1000&pageSize=1000&page=${page}`);
export const fetchAllAdminLessons = async () => {
    const uniqueMap = new Map();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        try {
            const res = await listLessons(page);
            const list = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
            if (list.length === 0) hasMore = false;
            else {
                list.forEach(i => { const id = i._id || i.id; if (id) uniqueMap.set(id, i); });
                if (list.length < 10) hasMore = false; else page++;
            }
        } catch (e) {
            console.warn("Lessons recursive fetch failed", e);
            hasMore = false;
        }
        if (page > 300) break;
    }
    return Array.from(uniqueMap.values());
};
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
