<div align="center">

# 🎓 STUDDY-BUDDY

**A student workspace for planning, reviewing, and studying together.**

Plan assessments, turn notes into flashcards, track focus sessions, and connect with classmates.

![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Express](https://img.shields.io/badge/Backend-Express-333333)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![Socket.IO](https://img.shields.io/badge/Real--time-Socket.IO-010101)

[Features](#features) · [Account roles](#account-roles) · [Local setup](#local-setup) · [Report an issue](https://github.com/kael-coding/STUDDY-BUDDY/issues)

</div>

---

## Features

| Feature | What you can do |
| --- | --- |
| **Study Planner** | Schedule assessments and tasks, track topic checklists, link notes, and pick up unfinished forms from saved drafts. |
| **Study Library** | Organize notes by subject and create flashcards from your notes. |
| **Flashcard Review** | Practice flashcards and mark difficult cards as **Review Again**. |
| **Review Radar** | See upcoming assessments and flashcards that need another review. |
| **Focus Session** | Start a 15-, 25-, or 50-minute timer. Pause, resume, reset, or take up to two five-minute breaks per session. Focus resumes from the remaining time after a break. |
| **Study Progress and Achievements** | View completed focus sessions, track weekly study activity, and earn achievements. |
| **Community and Study Groups** | Share posts, save unfinished drafts, discuss study topics, and create or join groups. |
| **Messages and Notifications** | Chat privately, edit or delete your own messages, and receive updates about deadlines, post activity, and report outcomes. |
| **Profile, Settings, Archive, and Trash** | View your posts and created groups, edit your account in Settings, and manage archived or deleted study items. |

## Account roles

| Role | Access |
| --- | --- |
| **Student** | Use the study workspace, participate in the community, create or join study groups, send messages, and report posts. |
| **Admin** | Use the Dashboard to manage accounts, review community reports, and moderate posts. |

Public signup creates a student account. Authentication supports email verification, password reset, and access and refresh tokens.

## Tech stack

| Area | Tools |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express, Socket.IO, node-cron |
| **Database** | MongoDB, Mongoose |
| **Email and images** | Nodemailer with Gmail, Cloudinary |

## Local setup

Use Git, Node.js 22 or later with npm, and either a local MongoDB instance or a MongoDB Atlas connection string.

### 1. Clone and install

```sh
git clone https://github.com/kael-coding/STUDDY-BUDDY.git
cd STUDDY-BUDDY
npm install
npm install --prefix frontend
```

### 2. Configure environment variables

Create a `.env` file next to the root `package.json` and replace the example values.

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/studdy-buddy
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173

EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

- For MongoDB Atlas, set `MONGO_URI` to your Atlas connection string.
- Set the Gmail credentials to test signup verification and password reset emails. Password reset links use `CLIENT_URL`.
- Set the Cloudinary credentials to test image uploads.

### 3. Start the development servers

Run both commands from the repository root in separate terminals.

**Terminal 1 · Backend**

```sh
npm run dev
```

**Terminal 2 · Frontend**

```sh
npm run dev --prefix frontend
```

Open [http://localhost:5173](http://localhost:5173). Vite forwards API and Socket.IO requests to the backend on port `5000`.

## Production build

```sh
npm run build --prefix frontend
npm start
```

Express serves the compiled frontend from `frontend/dist`. Set `CLIENT_URL` to your deployed app URL so password reset links open the right page.

## Contributing

Fork the repository, make your changes on a branch, and open a pull request. When reporting a bug, include the steps to reproduce it and the result you expected. [GitHub issues](https://github.com/kael-coding/STUDDY-BUDDY/issues)

---

Maintained by [Kael Coding](https://github.com/kael-coding).
