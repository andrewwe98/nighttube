# NightTube

A split deployment video platform with a static Next.js frontend on GitHub Pages and an Express/MongoDB backend on Render.

## Features

- Dark, interview-ready landing experience with glassmorphism video cards
- Credentials authentication with account creation
- JWT auth against a Render-hosted API
- MongoDB Atlas persistence for saved videos
- Authenticated YouTube search and trending video display via the YouTube Data API
- GitHub Actions workflow that deploys the static frontend to GitHub Pages

## Architecture

- Frontend: Next.js static export in this repo root
- Backend: Express app in [server/package.json](/Users/andrewwells/youtube-clone/server/package.json)
- Database: MongoDB Atlas
- Hosting:
  Frontend on GitHub Pages
  Backend on Render

## Frontend Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Copy the frontend environment template:

```bash
cp .env.example .env.local
```

3. Point `NEXT_PUBLIC_API_BASE_URL` at your backend.

4. Start the frontend:

```bash
npm run dev
```

## Backend Setup

1. Install backend dependencies:

```bash
cd server
npm install
```

2. Copy the backend environment template:

```bash
cp .env.example .env
```

3. Set these values in `server/.env` or Render environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `YOUTUBE_API_KEY`
- `FRONTEND_URL`

4. Start the backend locally:

```bash
cd server
npm run dev
```

## GitHub Pages Deploy

1. Push this repo to GitHub.
2. In GitHub, enable Pages with `GitHub Actions` as the source.
3. Add a repository secret named `NEXT_PUBLIC_API_BASE_URL`.
4. Set it to your Render backend URL, for example `https://nighttube-api.onrender.com`.
5. Push to `main` and the workflow in [.github/workflows/deploy-pages.yml](/Users/andrewwells/youtube-clone/.github/workflows/deploy-pages.yml) will deploy the frontend.

## Render Deploy

1. Create a new Render Web Service from the `server` folder.
2. Use:
- Build command: `npm install`
- Start command: `npm start`
3. Add the backend environment variables from `server/.env.example`.
4. Set `FRONTEND_URL` to your GitHub Pages URL, for example `https://your-username.github.io/your-repo`.

## Important

GitHub Pages cannot host your backend or database.
The frontend is static only.
Render runs the API.
MongoDB Atlas stores the data.
