import { apiFetch } from "./api";

/**
 * Student-facing curriculum API calls.
 * These hit the public/student routes verified in the backend controller.
 */

// Standards list using the public curriculum endpoint
export const getStudentStandards = (page = 1) => apiFetch(`/v1/curriculum/standards?limit=1000&pageSize=1000&size=1000&per_page=1000&page=${page}`);

// Recursive helper to get EVERYTHING
export const fetchAllStudentStandards = async () => {
    const uniqueMap = new Map();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
        try {
            const res = await getStudentStandards(page);
            const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
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
            console.error("Recursive fetch failed on page", page, e);
            hasMore = false;
        }
        if (page > 40) break; // Increased safety break
    }
    return Array.from(uniqueMap.values());
};

// Subjects list filtered by standardId (public)
export const getStudentSubjects = (standardId) => 
  apiFetch(`/v1/curriculum/subjects?standardId=${encodeURIComponent(standardId)}`);

// Units list filtered by subjectId (public)
export const getStudentUnits = (subjectId) => 
  apiFetch(`/v1/units?subjectId=${encodeURIComponent(subjectId)}`);

// Chapters list filtered by unitId (public)
export const getStudentChapters = (unitId) => 
  apiFetch(`/v1/chapters?unitId=${encodeURIComponent(unitId)}`);

// Lessons list filtered by chapterId (public)
// This endpoint automatically calculates unlocked/completed status for the user
export const getStudentLessons = (chapterId) => 
  apiFetch(`/v1/lessons?chapterId=${encodeURIComponent(chapterId)}`);

// Quiz fallback as per user request (kept in /v1/admin for now if dedicated student route is unknown)
export const getStudentQuizByChapter = (chapterId) => 
  apiFetch(`/v1/admin/quizzes/latest?chapterId=${encodeURIComponent(chapterId)}`).catch(() => null);
// Standard resolver to bridge codes (Grade_8) to IDs (ObjectId) purely on frontend
export const resolveStandardCodeToId = async (codeOrId) => {
  if (!codeOrId) return null;
  // If it's already a valid mongo ID (approx check), return it
  if (/^[0-9a-fA-F]{24}$/.test(codeOrId)) return codeOrId;

  try {
    const res = await getStudentStandards();
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    const match = list.find(s => s.code === codeOrId || s._id === codeOrId);
    return match ? match._id : codeOrId;
  } catch (err) {
    console.error("Standard resolution failed:", err);
    return codeOrId;
  }
};
