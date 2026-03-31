# Gamified Learning - Frontend Documentation

This document provides a comprehensive overview of the current state of the Gamified Learning frontend application.

## 1. System Overview
The frontend is a React-based Next.js application designed as the client portal for the gamified educational platform. It handles user authentication, curriculum navigation, interactive quiz attempts, gamification visualization (XP, coins, streaks), and administrative CRUD interfaces.

### Core Tech Stack:
- **Framework**: Next.js (App Router)
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS
- **API Client**: Vanilla `fetch` via centralized `lib/api.js` interceptor
- **Icons**: Material Icons / Google Fonts

---

## 2. Project Structure
- `app/`: Next.js App Router definitions (pages, layouts, loading states).
- `lib/api.js`: Core fetch utility featuring automatic JWT `auth_token` refreshing and concurrent request queuing.
- `hooks/`: Custom React hooks (e.g., `useRequireAuth` for protecting authenticated paths).
- `components/`: Reusable interface elements.
- `public/`: Static graphical assets (logos, default avatars).

---

## 3. Ready Features (Implemented)

### Authentication & User Management
- **OTP Login**: Request and verify OTP via UI, securely storing tokens in HTTPOnly-mimicking `localStorage`.
- **Profile & Onboarding**: Complete `/completeprofile` onboarding flow enforcing Standard, Subject, and Avatar selection.
- **Session Resilience**: Automatic, background seamless token refreshing via the `apiFetch` interceptor on `401 Unauthorized`.

### Curriculum Management
- **Hierarchical Visualization**: `/structure` page navigates dynamic trees of Subjects -> Units -> Chapters -> Lessons.
- **Progress Tracking**: Dynamic lock/unlock pathing visualizers based on the user's previously completed attempts.
- **Admin Authoring**: Full Admin UI for creating/deleting Standards, Subjects, Units, Chapters, and Lessons.

### Learning & Gamification
- **Quiz Attempts**: Interactive UI for multiple-choice quizzes, instant local feedback, and submission evaluation.
- **Progress Visualization**: Dashboard and Analytics pages showcasing XP, Coins, Diamonds, and multi-colored activity charts.
- **Leaderboards**: Top-3 medal highlights and rank indicators for Weekly Growth and Mastery.

### AI Integration
- **Contextual Chat**: Interactive floating AI chat built into `/chat` handling live tutoring conversations with rate-limit warnings.

---

## 4. Pending Tasks / Left to Do

### Missing Backend Integration (Blockers)
- **Student Quiz Fetching (`app/lesson` & `app/quiz`)**: The backend currently lacks a student-facing endpoint to fetch quizzes. To function temporarily, the frontend is hardcoded to use `GET /v1/admin/quizzes/latest?lessonId=X`. **This means a regular user will receive a 403 Forbidden until a student endpoint is created.**
- **Lesson Content**: `app/lesson/page.jsx` is missing rich HTML content because the backend `GET /v1/lessons` only returns metadata. The actual "reading material" before a quiz is omitted.

### Feature Enhancements (UI Ready, API Pending)
- **Recent Lesson (`app/dashboard`)**: The dashboard "Continue Learning" card falls back to `/subjects` because there is no `GET /v1/lessons/recent` backend endpoint implemented yet.
- **Chapter Tests (`app/structure`)**: The curriculum page UI shows a locked "Chapter Test" block at the end of each chapter, but the backend does not yet support chapter-wide quizzes.
- **Badges (`app/analytics`)**: Badges and achievements are visually mocked on the analytics page. True synchronization requires a dedicated `GET /v1/user/badges` endpoint.
- **Daily Quotes (`app/dashboard`)**: The motivational daily quote card is static text; requires a backend rotational data feed.
- **Subjects Route Override**: To avoid Admin 403 locks, the frontend Dashboard explicitly uses `/v1/curriculum/subjects?standardId=X` rather than the `admin/subjects` route.

---

## 5. Page Route List & API Dependencies

### Public & Auth
- `/login` - OTP request and input
  - *Dependencies:* `POST /v1/auth/request-otp`, `POST /v1/auth/verify-otp`
- `/completeprofile` - Initial onboarding
  - *Dependencies:* `GET /v1/me`, `GET /v1/curriculum/standards`, `PATCH /v1/me/profile`

### Student Navigation
- `/dashboard` - Main hub
  - *Dependencies:* `GET /v1/me`, `GET /v1/dashboard/home`, `GET /v1/leaderboards/weekly-growth`, `GET /v1/curriculum/subjects`
- `/analytics` - Detailed statistics
  - *Dependencies:* `GET /v1/me`, `GET /v1/analytics`
- `/leaderboard` - Competitive ranks
  - *Dependencies:* `GET /v1/me`, `GET /v1/leaderboards/weekly-growth`, `GET /v1/leaderboards/mastery`
- `/subjects` - Available courses
  - *Dependencies:* `GET /v1/me`, `GET /v1/curriculum/subjects`
- `/chat` - AI interaction
  - *Dependencies:* `POST /v1/ai/chat`

### Curriculum & Gameplay
- `/structure` - Nested curriculum levels
  - *Dependencies:* `GET /v1/units`, `GET /v1/chapters`, `GET /v1/lessons`
- `/lesson` - Gateway to quiz
  - *Dependencies:* `GET /v1/admin/quizzes/latest` *(Pending non-admin route)*
- `/quiz` - Play state & submission
  - *Dependencies:* `GET /v1/admin/quizzes/latest`, `POST /v1/attempts/submit`

### Administration
- `/admin` - Dashboard summary (`GET /v1/admin/metrics`, `GET /v1/health`)
- `/admin/seed` - AI Curriculum Generator (`POST /v1/admin/chapters`, `POST /v1/admin/quizzes/version`)
- `/admin/users` - List all users (`GET /v1/admin/users`)
- `/admin/lesson/[id]` - Lesson Quiz Editor (`GET /v1/admin/quizzes/latest`, `POST /v1/admin/quizzes/version`) 
- *Other mapped Admin CRUDs operate on their respective `GET/POST/PATCH/DELETE /v1/admin/(standards|subjects|units|chapters|lessons)`.*
