# STUDDY-BUDDY

Study Buddy is a student productivity and collaboration platform. Plan assessments, turn notes into flashcards, track focused study time, and connect with classmates in one workspace.

## Student workspace

| Feature | What you can do |
| --- | --- |
| **Study Planner** | Schedule tasks and assessments, track topic checklists, and link assessments to notes. Unfinished planner forms can be restored from drafts. |
| **Study Library and Flashcard Review** | Organize notes by subject, create flashcards from a note, and revisit cards marked **Review Again**. |
| **Review Radar** | See what needs attention, including upcoming assessments and flagged flashcards. |
| **Focus Session** | Choose a 15-, 25-, or 50-minute session. Pause, resume, reset, or take up to two five-minute breaks. Focus resumes from the remaining time when the break ends or you resume early. Completed sessions count toward Study Progress. |
| **Study Progress and Achievements** | View weekly focus activity and earn achievements as you use the workspace. |
| **Community and Study Groups** | Share posts, save unfinished post drafts, discuss study topics, and create or join groups. |
| **Messages and Notifications** | Start private chats, edit or delete your own messages, and get updates about deadlines, post activity, and report outcomes. |
| **Profile, Settings, Archive, and Trash** | View your posts and created groups on your profile, edit account details in Settings, and manage archived or deleted study items. |

## Accounts and moderation

- **Students** can sign up, verify their email, and use the study and community tools. Accounts support password reset and access and refresh tokens.
- **Admins** use the Admin Dashboard to manage accounts, review community reports, and moderate posts. Public signup creates student accounts.

## Tech stack

- **Frontend** · React, Vite, Tailwind CSS, and Zustand
- **Backend** · Node.js, Express, Socket.IO, and node-cron
- **Data** · MongoDB and Mongoose
- **Integrations** · Nodemailer with Gmail for account emails and Cloudinary for image uploads

## Run locally

You need Git, Node.js 22 or later with npm, and a local MongoDB instance or a MongoDB Atlas connection string.

### 1. Clone and install

```sh
git clone https://github.com/kael-coding/STUDDY-BUDDY.git
cd STUDDY-BUDDY
npm install
npm install --prefix frontend
```

### 2. Configure the backend

Create a `.env` file next to the root `package.json`. Replace the example values with your own credentials.

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

- Use your Atlas connection string for `MONGO_URI` if you use Atlas.
- Configure Gmail credentials to test verification and password reset emails. `CLIENT_URL` is the base URL for the reset link.
- Configure Cloudinary to test features that upload images.

### 3. Start both development servers

In the first terminal, start the backend from the repository root.

```sh
npm run dev
```

In a second terminal, start Vite from the repository root.

```sh
npm run dev --prefix frontend
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies API and Socket.IO requests to the backend on port `5000`.

### Build the frontend

```sh
npm run build --prefix frontend
```

The production backend serves the build from `frontend/dist` when started with `npm start`.

## Contributing

Fork the repository, make your changes on a branch, and open a pull request. For bugs, include the steps to reproduce and describe what you expected to happen. [GitHub issues](https://github.com/kael-coding/STUDDY-BUDDY/issues)
