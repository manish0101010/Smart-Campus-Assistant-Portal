# 🎓 Smart Campus Assistant Portal

A full-stack **MERN** web application that serves as an intelligent campus information hub. It features a role-based access system with an **NLP-powered chatbot** for students and a comprehensive **Admin Dashboard** for managing campus data and monitoring chatbot analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [NLP System](#nlp-system)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## 🧠 Overview

The Smart Campus Assistant Portal solves the problem of students having to search multiple sources for campus information (exam schedules, events, notices). Instead, students can simply **chat with an AI assistant** that understands natural language and fetches real-time data from the campus database. Admins manage all data through a dedicated dashboard.

---

## ✨ Features

### 👨‍🎓 Student Features
- **NLP Chatbot Interface** — Ask questions in natural language about:
  - 📅 Exam schedules
  - 🎉 Campus events
  - 📢 Official notices and announcements
- **Department-filtered Results** — Responses are personalized based on the student's department
- **Notification Bell** — Real-time notifications for new events, exams, and notices posted by the admin
- **Greeting Recognition** — The bot handles casual greetings and guides users

### 🛠️ Admin Features
- **Event Management** — Create and delete campus events (title, date, description, department)
- **Exam Schedule Management** — Post and remove exam schedules with date and department details
- **Notice Board Management** — Publish and delete official notices for specific departments
- **Analytics Dashboard** — View chatbot usage statistics including:
  - 📊 Total queries processed
  - 📈 Queries per day (line chart)
  - 🥧 Top intents / most asked topics (pie chart)
  - 🏢 Department-wise usage breakdown (bar chart)
  - ❓ Count of unanswered queries
  - 🗒️ Recent chat log viewer (last 50 queries)
- **Auto-Notifications** — When the admin posts any event, exam, or notice, a notification is automatically created for the relevant department

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)** — Admins and Students have completely separate dashboards and access rights
- **JWT Authentication** — Secure token-based login with 30-day token expiry
- **Password Hashing** — All passwords are hashed using bcrypt before storage
- **Protected Routes** — Both frontend routes and backend API routes are protected; unauthorized access redirects to login
- **Persistent Sessions** — User session is saved in `localStorage` so users stay logged in on page refresh

---

## 🛠️ Tech Stack

### Frontend (Client)

| Technology | Version | Purpose |
|---|---|---|
| **React** | v19 | UI framework — component-based interface |
| **Vite** | v8 | Build tool and fast dev server |
| **React Router DOM** | v7 | Client-side routing and protected navigation |
| **Axios** | v1.15 | HTTP client for API communication |
| **Recharts** | v3.8 | Data visualization (line, bar, and pie charts) |
| **React Icons** | v5.6 | Icon library used throughout the UI |
| **React Context API** | Built-in | Global auth state management |
| **Vanilla CSS** | — | Custom styling for all pages and components |

### Backend (Server)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | JavaScript runtime for the server |
| **Express.js** | v5 | Web framework for REST API |
| **MongoDB** | — | NoSQL database for storing all campus data |
| **Mongoose** | v9.4 | MongoDB object modeling (ODM) |
| **node-nlp** | v5 alpha | Natural Language Processing — intent classification & entity extraction |
| **JSON Web Token (JWT)** | v9 | Stateless authentication |
| **bcryptjs** | v3 | Password hashing |
| **dotenv** | v17 | Environment variable management |
| **cors** | v2.8 | Cross-Origin Resource Sharing (CORS) support |

---

## 📁 Project Structure

```
Smart Campus Assistant Portal/
├── client/                         # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state (login, logout, user)
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login & Register page
│   │   │   ├── Login.css
│   │   │   ├── AdminDashboard.jsx  # Full admin panel with tabs
│   │   │   ├── AdminDashboard.css
│   │   │   ├── StudentChatbot.jsx  # Student chatbot interface
│   │   │   └── StudentChatbot.css
│   │   ├── App.jsx                 # Router with protected route logic
│   │   ├── App.css
│   │   ├── main.jsx                # React app entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                         # Node.js + Express Backend
    ├── config/
    │   └── db.js                   # MongoDB connection setup
    ├── controllers/
    │   ├── adminController.js      # CRUD for events, exams, notices + analytics
    │   ├── authController.js       # Register & login logic
    │   ├── chatController.js       # NLP query handler + chat log storage
    │   └── notificationController.js # Fetch notifications for students
    ├── middleware/
    │   └── authMiddleware.js       # JWT verification middleware (protect routes)
    ├── models/
    │   ├── User.js                 # User schema (name, email, role, dept, semester)
    │   ├── Event.js                # Event schema (title, description, date, dept)
    │   ├── ExamSchedule.js         # Exam schema (subject, date, time, dept)
    │   ├── Notice.js               # Notice schema (title, content, date, dept)
    │   ├── Notification.js         # Notification schema (message, dept, read status)
    │   └── ChatLog.js              # Chat log schema (query, intent, dept, found)
    ├── nlp/
    │   ├── nlpManager.js           # NLP model training, intent setup, entity extraction
    │   └── intentHandlers.js       # Maps intents to MongoDB queries
    ├── routes/
    │   ├── authRoutes.js           # POST /api/auth/register, /api/auth/login
    │   ├── adminRoutes.js          # CRUD routes for events, exams, notices, analytics
    │   ├── chatRoutes.js           # POST /api/chat
    │   └── notificationRoutes.js   # GET /api/notifications
    ├── model.nlp                   # Saved/trained NLP model file
    ├── server.js                   # Express app entry point
    └── package.json
```

---

## ⚙️ How It Works

### Authentication Flow
1. User registers/logs in with email and password
2. Server validates credentials, hashes password (bcrypt), and issues a **JWT token**
3. Token is stored in `localStorage` on the frontend
4. Every protected API request sends the token in the `Authorization: Bearer <token>` header
5. `authMiddleware.js` verifies the token and attaches the user object to `req.user`
6. React's `AuthContext` reads the token on page load for persistent sessions

### Student Chatbot Flow
1. Student types a natural language query (e.g., *"when is my CSE exam?"*)
2. Frontend sends the query via `POST /api/chat` with the JWT token
3. Server processes the query through **node-nlp**:
   - Classifies the **intent** (e.g., `exam.query`, `event.query`, `notice.query`, `greeting`)
   - Extracts **entities** (e.g., department = `CSE`, date = `this week`)
4. `intentHandlers.js` maps the intent → MongoDB query → fetches real data
5. A **ChatLog** entry is saved for analytics
6. The response is returned and displayed in the chat UI

### Admin Content → Automatic Notifications
When an admin creates an event, exam, or notice:
- The `adminController` automatically creates a **Notification** record in MongoDB
- Students can see these notifications via the bell icon in the chatbot interface

---

## 🔗 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |

### Admin (`/api/admin`) — Admin role only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/events` | Get all events |
| POST | `/api/admin/events` | Create a new event |
| DELETE | `/api/admin/events/:id` | Delete an event |
| GET | `/api/admin/exams` | Get all exam schedules |
| POST | `/api/admin/exams` | Create a new exam schedule |
| DELETE | `/api/admin/exams/:id` | Delete an exam schedule |
| GET | `/api/admin/notices` | Get all notices |
| POST | `/api/admin/notices` | Create a new notice |
| DELETE | `/api/admin/notices/:id` | Delete a notice |
| GET | `/api/admin/analytics` | Get chatbot analytics data |

### Chat (`/api/chat`) — Student role only
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Process a student's natural language query |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get notifications for the logged-in student's department |

---

## 🗄️ Database Models

| Model | Key Fields |
|---|---|
| **User** | `name`, `email`, `password` (hashed), `role` (Admin/Student), `department`, `semester` |
| **Event** | `title`, `description`, `date`, `department` |
| **ExamSchedule** | `title`, `subject`, `date`, `time`, `department` |
| **Notice** | `title`, `content`, `date`, `department` |
| **Notification** | `message`, `targetDepartment`, `isRead`, `createdAt` |
| **ChatLog** | `query`, `intent`, `department`, `resultFound`, `timestamp` |

---

## 🤖 NLP System

Built with **`node-nlp`** (Node NLP library), the chatbot uses:

### Intents Trained
| Intent | Example Queries |
|---|---|
| `exam.query` | *"when is my exam"*, *"show exam schedule"*, *"midterm schedule"* |
| `event.query` | *"what events are coming up"*, *"next cultural fest"*, *"sports meet timing"* |
| `notice.query` | *"any new notices"*, *"latest announcements"*, *"college alerts"* |
| `greeting` | *"hello"*, *"hi"*, *"good morning"*, *"how are you"* |

### Named Entity Extraction
| Entity Type | Recognized Values |
|---|---|
| `department` | CSE, ECE, EE, MECH, CIVIL (with aliases) |
| `date_keyword` | today, tomorrow, this week, next week |

### Confidence Threshold
- Scores **< 0.6** are treated as unrecognized — the bot replies with a helpful fallback message
- The trained model is saved as `model.nlp` so it doesn't retrain on every server restart

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Smart Campus Assistant Portal"
```

### 2. Setup and Start the Backend
```bash
cd server
npm install
# Create a .env file (see Environment Variables section)
node server.js
```
Server runs at: `http://localhost:5000`

### 3. Setup and Start the Frontend
```bash
cd client
npm install
npm run dev
```
Client runs at: `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartcampus
JWT_SECRET=your_super_secret_jwt_key
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express server will run on (default: 5000) |
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |

---

## 👥 User Roles

| Role | Default Route | Capabilities |
|---|---|---|
| **Admin** | `/admin` | Manage events, exams, notices; view analytics |
| **Student** | `/student` | Chat with the AI assistant; view notifications |

> Role is assigned during registration. Access is strictly enforced on both the frontend (route guards) and backend (middleware).

---

*Built with ❤️ as a Smart Campus Portal — making campus information accessible through natural conversation.*
