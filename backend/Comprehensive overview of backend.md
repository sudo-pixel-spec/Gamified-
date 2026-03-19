# Gamified Learning - Backend Documentation

This document provides a comprehensive overview of the current state of the Gamified Learning backend.

## 1. System Overview
The backend is a Node.js/Express application designed to manage a gamified educational platform. It handles user authentication, curriculum delivery, quiz attempts, gamification logic (XP, coins, streaks), and administrative controls.

### Core Tech Stack:
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **AI**: OpenAI (GPT-4o-mini)
- **Background Jobs**: Agenda (MongoDB-backed)
- **Validation**: Zod
- **Logging**: Pino

---

## 2. Project Structure
- [src/app.ts](backend/Production/src/app.ts): Application entry point and middleware/route registration.
- `src/routes/`: Route definitions for various modules.
- `src/controllers/`: Request handling logic.
- `src/services/`: Core business logic and external integrations (AI, Email, SMS, Gamification).
- `src/models/`: Mongoose schemas for data persistence.
- `src/jobs/`: Background task definitions and handlers (via Agenda).
- `src/middleware/`: Custom Express middleware (Auth, Rate limiting, Error handling).

---

## 3. Ready Features (Implemented)

### Authentication & User Management
- **OTP Login**: Request and verify OTP via Email or SMS.
- **Providers**: Integrated with Resend, SMTP, and Twilio/Msg91 (stubs).
- **Social Login**: Google Sign-In support.
- **Auth Tokens**: JWT-based access and refresh tokens.
- **Profile & Onboarding**: Complete user profile and onboarding status tracking.

### Curriculum Management
- **Hierarchical Structure**: Standards -> Subjects -> Units -> Chapters -> Lessons.
- **Admin CRUD**: Full CRUD operations for all curriculum levels with audit logging.
- **Versioning**: Quiz versioning support (allows multiple versions of a quiz for a lesson).

### Learning & Gamification
- **Quiz Attempts**: Submit quiz answers, automated scoring.
- **XP & Levels**: Automatic XP calculation based on performance and level progression.
- **Economy**: Coin and Diamond rewards for perfect scores and difficulty levels.
- **Streaks**: Daily streak tracking and management.
- **Leaderboards**: Weekly Growth (XP based) and Mastery (Total XP) leaderboards.

### AI Integration
- **Contextual Chat**: Interactive AI chat scoped to lesson content.
- **Rate Limiting**: AI-specific rate limits to prevent abuse.
- **Logging**: Background logging of AI interactions for auditing.

### Admin CMS & System
- **Role-Based Access**: Support for Super Admins and Regular Admins (scoped to specific Standards).
- **Audit Logs**: Comprehensive tracking of all administrative actions.
- **User CRM**: Award badges, award XP, reset progress, and delete/edit users.
- **System Control**: Reset leaderboards, update configurations, and view API logs.
- **Job Management**: Monitor, retry, or delete background jobs.

---

## 4. Pending Tasks / Left to Do

### Communication Delivery
- **Real SMS Delivery**: [Msg91SmsProvider](backend/Production/src/services/smsProvider.ts#17-24) and [TwilioSmsProvider](backend/Production/src/services/smsProvider.ts#25-32) currently log to console. Integration with their respective APIs is pending.
- **Notification Delivery**: The notification logic ([sendNotification](backend/Production/src/controllers/admin.notifications.controller.ts#30-74)) creates records but lacks the actual triggering of Push Notifications (OneSignal/FCM) or WebSockets.

### Feature Enhancements
- **Advanced Analytics**: Some analytics endpoints provides basic data; more complex reporting (retention, cohort analysis) is not yet fully implemented.
- **Content Generation**: Further automation for AI-generated quiz questions directly from lessons.
- **Admin Metrics**: The main admin dashboard metrics are functional but could be expanded with more granular data visualizations.

---

## 5. API Route List (v1)

### Auth
- `POST /v1/auth/request-otp` - Request a login OTP
- `POST /v1/auth/verify-otp` - Verify OTP and get tokens
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Invalidate tokens
- `POST /v1/auth/google` - Sign in with Google

### User
- `GET /v1/me` - Get current user profile
- `PATCH /v1/me/profile` - Update user profile details
- `PATCH /v1/me/onboarding` - Update onboarding status

### Curriculum
- `GET /v1/curriculum/standards` - List available standards (grades)
- `GET /v1/curriculum/subjects` - List subjects for a standard
- `GET /v1/units` - List units for a subject
- `GET /v1/chapters` - List chapters for a unit
- `GET /v1/lessons` - List lessons for a chapter (Authenticated)

### Learning
- `POST /v1/attempts/submit` - Submit a quiz attempt
- `GET /v1/leaderboards/weekly-growth` - Get weekly growth leaderboard
- `GET /v1/leaderboards/mastery` - Get overall mastery leaderboard
- `POST /v1/ai/chat` - Interact with AI tutor

### System
- `GET /v1/health` - Basic health check
- `GET /v1/ready` - Database readiness check
- `GET /v1/dashboard/home` - User dashboard summary metrics
- `GET /v1/analytics` - System-wide analytics summary

### Admin (Required Admin/SuperAdmin Role)
#### Curriculum Management
- `GET/POST/PATCH/DELETE /v1/admin/standards`
- `GET/POST/PATCH/DELETE /v1/admin/subjects`
- `GET/POST/PATCH/DELETE /v1/admin/units`
- `GET/POST/PATCH/DELETE /v1/admin/chapters`
- `GET/POST/PATCH/DELETE /v1/admin/lessons`
- `PATCH /v1/admin/(standards|subjects|units|chapters|lessons|quizzes)/:id/restore` - Restore deleted entities

#### Quiz Management
- `GET /v1/admin/quizzes/latest` - Get latest quiz version for a lesson
- `POST /v1/admin/quizzes/version` - Create a new quiz version
- `PATCH /v1/admin/quizzes/:id/published` - Toggle publish status
- `PATCH /v1/admin/quizzes/:id/publish` - Publish version and unpublish others

#### User & Engagement
- `GET /v1/admin/users` - List all users
- `PATCH/DELETE /v1/admin/users/:id` - Manage specific user
- `POST /v1/admin/users/:id/badges` - Award a badge to a user
- `POST /v1/admin/users/:id/xp` - Award XP to a user
- `POST /v1/admin/users/:id/reset-progress` - Clear user learning data
- `GET /v1/admin/users/:id/profile` - View detailed user profile
- `GET/POST /v1/admin/notifications` - Send/List notifications
- `GET/POST/PATCH/DELETE /v1/admin/events` - Manage platform events

#### System & Infrastructure
- `GET /v1/admin/metrics` - Admin dashboard highlights
- `POST /v1/admin/admins` - Create admin account (SuperAdmin only)
- `GET/PATCH /v1/admin/system/leaderboard` - Configure leaderboards
- `POST /v1/admin/system/leaderboard/reset` - Reset current leaderboard (SuperAdmin only)
- `GET /v1/admin/system/api-logs` - View system API logs (SuperAdmin only)
- `GET /v1/admin/jobs` - List background jobs (SuperAdmin only)
- `POST /v1/admin/jobs/:id/retry` - Retry failed job (SuperAdmin only)
- `DELETE /v1/admin/jobs/:id` - Delete job (SuperAdmin only)
- `GET /v1/admin/jobs/status` - Check background worker status
- `GET /v1/admin/audit` - View administrative audit logs
