# NightTube

A polished full-stack video platform built with Next.js App Router, Tailwind CSS, MongoDB, and NextAuth.

## Features

- Dark, interview-ready landing experience with glassmorphism video cards
- Credentials authentication with account creation
- Google authentication via NextAuth
- Saved videos persisted in local storage for guests
- MongoDB sync for saved videos when authenticated
- Authenticated YouTube search and trending video display via the YouTube Data API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. By default, local development uses `mongodb://127.0.0.1:27017/nighttube`.

4. Add Google OAuth credentials to `.env.local` if you want Google sign-in.

5. Add `YOUTUBE_API_KEY` to load live YouTube videos after login.

6. Start the app:

```bash
npm run dev
```
