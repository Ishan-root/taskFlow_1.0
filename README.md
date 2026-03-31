# ⬡ TaskFlow — Task Management System

A full-stack Task Management System built with React, Node.js/Express, and MongoDB.
Covers TC01–TC25 from the TMS test case specification.

---

## Project Structure

```
tms/
├── backend/          # Express + MongoDB API
│   ├── src/
│   │   ├── index.js
│   │   ├── models/       (User, Task, Project)
│   │   ├── routes/       (auth, tasks, projects)
│   │   └── middleware/   (auth)
│   ├── .env.example
│   └── package.json
│
└── frontend/         # React SPA
    ├── public/
    ├── src/
    │   ├── api/          (axios instance)
    │   ├── components/   (Navbar, TaskModal, ConfirmDialog, StatusBadge)
    │   ├── context/      (AuthContext, ToastContext)
    │   └── pages/        (Login, Register, Home, Kanban, Progress, Collaboration, About)
    └── package.json
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local install OR MongoDB Atlas free tier)
- npm v9+

---

## Setup Instructions

### 1. Clone / unzip the project

```bash
cd tms
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tms
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

No `.env` needed for frontend — it proxies API calls to `http://localhost:5000` via `package.json` `proxy` field.

---

## Run Commands

### Start Backend

```bash
cd backend
npm start          # production
# OR
npm run dev        # development with nodemon (auto-restart)
```

Backend runs at: `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm start
```

Frontend runs at: `http://localhost:3000`

Open `http://localhost:3000` in your browser.

---

## Environment Variables

### Backend `.env`

| Variable       | Description                        | Example                          |
|----------------|------------------------------------|----------------------------------|
| PORT           | Port for Express server            | 5000                             |
| MONGO_URI      | MongoDB connection string          | mongodb://localhost:27017/tms    |
| JWT_SECRET     | Secret for signing JWT tokens      | my_very_long_secret_key          |
| JWT_EXPIRES_IN | JWT expiry duration                | 7d                               |

---

## API Endpoints

### Auth
| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| POST   | /api/auth/register  | Register new user  |
| POST   | /api/auth/login     | Login              |
| GET    | /api/auth/me        | Get current user   |

### Personal Tasks
| Method | Endpoint                   | Description            |
|--------|----------------------------|------------------------|
| GET    | /api/tasks                 | Get all user tasks     |
| POST   | /api/tasks                 | Create task            |
| PUT    | /api/tasks/:id             | Update task            |
| DELETE | /api/tasks/:id             | Delete task            |
| PUT    | /api/tasks/bulk/reorder    | Bulk reorder (Kanban)  |

### Collaboration
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/projects/create              | Host creates project     |
| POST   | /api/projects/join                | Join by code             |
| POST   | /api/projects/leave               | Leave project            |
| DELETE | /api/projects/delete              | Host deletes project     |
| GET    | /api/projects/my                  | Get user's project       |
| POST   | /api/projects/tasks               | Host adds project task   |
| PUT    | /api/projects/tasks/:taskId       | Update project task      |
| PUT    | /api/projects/tasks/bulk/reorder  | Bulk reorder             |

---

## Features Implemented

| Feature                          | Test Cases       |
|----------------------------------|------------------|
| User Registration (valid/invalid)| TC01, TC02       |
| User Login (valid/invalid)       | TC03, TC04       |
| Add/Edit/Delete personal tasks   | TC05–TC09        |
| Task table on Home page          | TC10, TC11       |
| Kanban board display             | TC12             |
| Drag-and-drop between columns    | TC13, TC15       |
| Add task from Kanban             | TC14             |
| Collaboration participants       | TC16, TC17       |
| Progress bar + percentage        | TC19, TC20       |
| Navigation between all sections  | TC21             |
| Logout + session termination     | TC25             |

---

## Password Requirements

Passwords must be:
- At least 8 characters
- Contain at least one uppercase letter
- Contain at least one number
- Contain at least one special character (`!@#$%^&*` etc.)

---

## Collaboration Rules

- A user can belong to **only one project** at a time
- The **host** (creator) can: add tasks, assign tasks to contributors, delete the project
- **Contributors** can: view tasks, move tasks on the Kanban board
- Projects are identified by a human-readable code (e.g. `alpha-team-482`)
- Anyone with the code can join
- Host cannot leave — they must delete the project
