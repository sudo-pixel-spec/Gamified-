# Gamified Learning — Frontend (v1)

A modern, gamified educational platform frontend built with **Next.js 16**.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Material Icons
- **API**: Custom `apiFetch` utility with JWT refresh interceptor

## Getting Started

### 1. Clone the frontend branch
```bash
git clone -b frontend --single-branch https://github.com/sudo-pixel-spec/Gamified-.git
cd Gamified-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` and fill in the values.

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## Pages
| Route | Description |
|---|---|
| `/login` | OTP-based authentication |
| `/completeprofile` | New user onboarding |
| `/dashboard` | Main student hub |
| `/subjects` | Browse available subjects |
| `/structure` | Unit → Chapter → Lesson navigator |
| `/lesson` | Lesson content viewer |
| `/quiz` | Interactive quiz player |
| `/analytics` | Personal progress stats |
| `/leaderboard` | Weekly & mastery rankings |
| `/chat` | AI tutor |
| `/admin` | Admin CMS (admin role required) |
