# 🚀 Backend TODO – Production Roadmap  
**Scope:**  
- Single **Learner account** (merged student + parent)  
- **Admin role**  
- **CBSE only** curriculum  
- **Std 8 active**, Std 9/10 placeholders  
- Profile gating  
- AI chatbot  
- Fair & unbiased weekly leaderboards  

---

# 📌 0. Repository & Engineering Base

## Project Setup
- [ ] Initialize backend (Node.js + Express + TypeScript)
- [ ] Configure ESLint + Prettier
- [ ] Environment validation
- [ ] Config modules
- [ ] Central error handler + standardized API response format
- [ ] Request ID middleware + structured logging

## Health & Docs
- [ ] `GET /health`
- [ ] `GET /ready` (Mongo/Redis/Queue checks)
- [ ] Swagger / OpenAPI docs

---

# 🗄 1. Database Models (Mongoose + Indexes)

## Core Models

### User
- email (unique)
- role (learner/admin)
- profile fields + `profileComplete`
- wallet (coins, diamonds)
- xp / level / streak / lastActiveDate
- settings (timezone, notifications)
- status flags (banned, deleted)
- Indexes: `email`, `role`, `createdAt`

### RefreshToken / Session
- userId
- tokenHash
- device info
- createdAt, expiresAt, revokedAt
- Reuse detection
- Indexes: `userId`, `expiresAt`, `tokenHash`

### Curriculum Structure
- Standard (CBSE: Std 8 active, Std 9/10 placeholders)
- Subject
- Unit
- Chapter
- Lesson
- Versioning + publish status
- Indexes on parentId + orderIndex

### Quiz (Versioned)
- lessonId
- version
- source (seed / ai)
- difficulty
- questions[]
- Index: `(lessonId, version desc)`

### Attempt
- userId
- lessonId
- quizId/version
- answers snapshot
- score
- timeSpent
- rewards (xp, coins, diamonds)
- idempotency key
- createdAt
- Indexes:
  - `(userId, createdAt)`
  - `(userId, lessonId)`
  - `(lessonId)`

### WalletTransaction
- userId
- type (earn/spend)
- currency (coins/diamonds)
- amount
- reason
- metadata
- Indexes: `userId`, `createdAt`

### LeaderboardWeekly
- weekStartDate
- boardType
- entries[]
- Index: `(weekStartDate, boardType)`

### UserWeeklyStats
- userId
- weekStartDate
- eligibleNewXP
- accuracyBand
- growthScore
- capsUsed
- flags

### Other Models
- ChatSession + ChatMessage
- AILog (chat / quizgen / explain)
- AdminAuditLog

---

# 🔐 2. Authentication & Security (Email OTP + JWT)

## OTP Flow
- [ ] `POST /v1/auth/request-otp`
  - Rate limit (IP + email)
  - Store OTP hash + expiry
  - Dev: log OTP
  - Prod: SES / SendGrid / Resend abstraction

- [ ] `POST /v1/auth/verify-otp`
  - Verify hash + expiry + attempts
  - Auto-create user (role=learner)
  - Issue access JWT
  - Issue refresh token (httpOnly cookie)
  - Rotation + reuse detection

- [ ] `POST /v1/auth/refresh`
- [ ] `POST /v1/auth/logout`

## Middleware
- requireAuth
- requireRole(admin)
- profileGate(learner)

## Security
- Helmet headers
- CORS restricted to CLIENT_ORIGIN
- Zod validation everywhere
- Global + route-specific rate limiting
- Basic anti-abuse system (ban flags / blocklist)

---

# 🧍 3. Profile Completion Gating

- [ ] `GET /v1/me`
- [ ] `PATCH /v1/me/profile`
  - Required field validation
  - Set `profileComplete = true`

## Rules
- All learner content routes require `profileComplete=true`
- Admin bypasses gating
- If incomplete → `403 PROFILE_INCOMPLETE`

---

# 📚 4. Curriculum APIs (CBSE Std 8 Active)

- [ ] `GET /v1/curriculum/standards`
- [ ] `GET /v1/curriculum/subjects?standardId=`
- [ ] `GET /v1/units?subjectId=`
- [ ] `GET /v1/chapters?unitId=`
- [ ] `GET /v1/lessons?chapterId=`
- [ ] `GET /v1/lessons/:lessonId`

## Unlock Logic
- Sequential within chapter
- Based on previous lesson completion
- Completion = attempt submitted (or threshold score)

Return flags:
- unlocked
- completed
- progress summary

Add indexes + caching for performance.

---

# 📝 5. Quiz System + Attempts

## Quiz Retrieval
- [ ] `GET /v1/quizzes/byLesson/:lessonId`
  - Latest published version
  - Fallback to seeded quiz

## Attempt Submission
`POST /v1/attempts/submit`

Server:
- Load quiz
- Validate answers
- Compute score + accuracy
- Compute rewards
- Update streak
- Atomic update (transaction)
- Create immutable Attempt
- Write WalletTransactions
- Update weekly stats

Response:
- score
- correctAnswers
- explanations
- xpAwarded
- walletDelta
- userSummary

## Deduplication  + Abuse
- Duplicate key header or submission hash
- Minimum time threshold
- Rate limit per minute

---

# 🎮 6. Gamification Engine

## XP Service
- Difficulty multiplier
- First-time bonus
- Time bonus cap
- Anti-farm protection

## Level Service
- Non-linear thresholds

## Streak Service
- UTC-based
- yesterday/today logic
- Freeze placeholder

## Wallet Service
- No negative balance
- Audit logs

## Achievements
- Streak milestones
- Mastery badges

---

# 🏆 7. Fair Weekly Leaderboards

## Leaderboards
- [ ] Weekly Growth (default)
- [ ] Mastery

## Growth Score Rules
- Count only NEW weekly progress
- Accuracy bonus tiers
- Capped streak bonus
- Daily contribution cap
- Repeat-easy penalty
- Eligibility rules:
  - Minimum time
  - Fully completed
  - Not suspicious

## Storage
- Maintain UserWeeklyStats
- Materialize top N in LeaderboardWeekly

## Endpoints
- `GET /v1/leaderboards/weekly-growth`
- `GET /v1/leaderboards/mastery`

## Jobs
- Weekly reset
- Anti-cheat detection job

---

# 🤖 8. AI System (Chatbot + Quiz Generation)

## AI Abstraction
```
aiClient.chat()
aiClient.generateQuiz()
aiClient.explainWrongAnswer()
```
   - Mock fallback when no key

## RAG Pipeline
- Store lesson chunks + embeddings
- Embed user query
- Top-k retrieval
- Grounded prompt with citations

## Endpoints
- `POST /v1/ai/chat`
- `POST /v1/ai/generate-quiz`
- `POST /v1/ai/explain`

## Safety
- Moderation (input + output)
- Refusal for cheating
- Rate limiting
- Logging with redaction

# 📊 9. Analytics
## Learner Endpoints
- `GET /v1/analytics/overview`
- `GET /v1/analytics/strengths`
- `GET /v1/analytics/weaknesses`
- `GET /v1/analytics/stuck-topics`
- `GET /v1/analytics/activity-log`

## Admin Metrics
- DAU / WAU / MAU
- Funnel
- Streak distribution
- Content performance
- AI usage
- CSV exports

## Event Tracking
- Store attempts
- Page events

# 🛠 10. Admin CMS
## Content Management
- CRUD: Standards, Subjects, Units, Chapters, Lessons
- Draft → Review → Publish workflow
- Quiz version management + rollback

## AI Admin Tools
- Prompt templates + versioning
- Moderation queue
- Manual quiz override

## User Management
- Search users
- Ban / unban
- Reset streak
- Audit logs

## Leaderboard Admin
- View weekly results
- View flagged cheaters
- Force recompute


# ✨ 11. Production Polish
- Feature flags table
- Notification service (streak reminders, digests)
- Advanced abuse detection
- Redis caching

## ✅ Production Definition of Done
- Secure OTP auth with refresh rotation
- Profile-gated learner flow
- Versioned quizzes + immutable attempts
- Fair, abuse-resistant weekly leaderboard
- AI with guardrails + logging
- Admin CMS + analytics
  
## Status: 🚧 In Development
## Target: Production-ready, scalable, cheat-resistant learning backend.
