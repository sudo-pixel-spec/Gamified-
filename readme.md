# Gamified Learning Platform

Backend-first implementation for a gamified learning website (CBSE Std 8 focus).

This project is in active development.

------------------------------------------------------------

STATUS

- Work in Progress
- Backend: in progress
- Frontend: 
- AI features: planned
- APIs and schemas: evolving, changes expected

------------------------------------------------------------

TECH STACK

Backend
- Node.js
- Express
- MongoDB
- JWT authentication
- Email OTP (passwordless)
- AI integration (chatbot, quiz generation)

Frontend
- Next.js

------------------------------------------------------------

PROJECT STRUCTURE

gamified-learning/
├── backend/    # Express + MongoDB
├── frontend/   # Next.js
└── README.md

------------------------------------------------------------

BACKEND RESPONSIBILITIES

- Email OTP authentication
- Profile completion gating
- CBSE Std 8 curriculum APIs
- Lessons, quizzes, and attempts
- XP, levels, streaks, rewards logic
- Weekly growth-based leaderboard logic
- AI chatbot
- AI quiz and explanation generation (with safe fallback)
- Admin analytics APIs (separate access)

------------------------------------------------------------

RUNNING BACKEND LOCALLY

Requirements
- Node.js 18+
- MongoDB (local or Atlas)

Environment Variables (backend/.env)
In DEV

------------------------------------------------------------

CURRENT BACKEND FOCUS

- Core data models (User, Lesson, Quiz, Attempt)
- Auth and profile-completion flow
- XP and streak calculation
- Fair leaderboard scoring logic
- AI service abstraction (mock + real provider)
- Versioned APIs (/v1)

------------------------------------------------------------

PRODUCT RULES (IMPORTANT)

- Only CBSE curriculum supported
- Std 8 fully implemented
- Std 9 and Std 10 are placeholders only
- Learner and parent share a single account
- Admin has separate access
- Profile completion is mandatory before accessing content
- XP and streaks must never be calculated on the client

------------------------------------------------------------

DEVELOPMENT NOTES

- APIs are versioned
- Expect breaking changes
- Seed data is temporary
- AI must always fail gracefully
- Backend is the source of truth for progress and rewards

------------------------------------------------------------

LICENSE

Private / Internal Use
