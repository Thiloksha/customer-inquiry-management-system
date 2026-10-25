# 📋 Customer Inquiry Management System

A full-stack web application for staff to manage customer inquiries, search existing records, and track each inquiry through its lifecycle.

## 📖 Overview

The Customer Inquiry Management System provides an authenticated workspace for recording and managing customer inquiries. It supports inquiry creation, search, status filtering, server-side validation, and duplicate-submission prevention.

## ✨ Key Features

- 🔐 **Staff Authentication** — sign-in and protected API endpoints.
- 📝 **Inquiry Management** — create and view customer inquiries.
- 🔎 **Search and Filtering** — find inquiries by customer name, contact information, subject, or inquiry number, and filter by status.
- 🔄 **Inquiry Lifecycle** — track inquiries as New, In Progress, or Resolved.
- ✅ **Input Validation** — reject submissions with missing required information.
- 🛡️ **Duplicate Prevention** — use idempotency keys to prevent repeated submissions.
- 🗄️ **Persistent Storage** — store staff and inquiry records in PostgreSQL.

## 🛠️ Technology Stack

| Component         | Technology                               |
| ----------------- | ---------------------------------------- |
| 💻 Frontend       | React, TypeScript, Vite                  |
| 🎨 Styling        | Tailwind CSS                             |
| ⚙️ Backend        | Node.js, Express, TypeScript             |
| 🗄️ Database       | PostgreSQL                               |
| 🔗 ORM            | Prisma                                   |
| 🔑 Authentication | JSON Web Tokens (JWT)                    |
| ✅ Validation     | Zod                                      |
| 🧪 Testing        | Vitest, Supertest, React Testing Library |

📁 Project Structure

```text
Customer Inquiry Management System/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── __tests__/
│       ├── middleware/
│       ├── routes/
│       ├── app.ts
│       └── server.ts
├── frontend/
│   └── src/
│       └── __tests__/
├── README.md
└── DECISIONS.md
```

## ⚙️ Prerequisites

Install the following before starting:

- [Node.js and npm](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

## 🚀 Getting Started

### 1️⃣ Clone the Repository

Replace the placeholder with the URL of your GitHub repository.

```bash
git clone https://github.com/Thiloksha/customer-inquiry-management-system.git
cd "Customer Inquiry Management System"
```

### 2️⃣ Configure PostgreSQL

Create a PostgreSQL database for the application. The default database used during development is:

```text
customer_inquiry_db
```

Make sure your PostgreSQL server is running and that the database credentials you configure can access this database.

### 3️⃣ Configure and Run the Backend

Open a terminal in the project root and run:

```powershell
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend` directory. Configure the environment variables required by the application, including:

- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — secret used to sign authentication tokens.
- `SEED_STAFF_NAME` — name for the seeded staff account.
- `SEED_STAFF_EMAIL` — email for the seeded staff account.
- `SEED_STAFF_PASSWORD` — password for the seeded staff account.

Use the exact variable names expected by your backend configuration. Keep this file private and do not commit it to Git.

Apply the database migrations:

```powershell
npx prisma migrate deploy
```

Seed the initial staff account:

```powershell
npm run seed
```

Start the backend using the development script configured in `backend/package.json`.

🌐 **Backend URL:** `http://localhost:5000`

### 4️⃣ Configure and Run the Frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the application in your browser:

🌐 **Frontend URL:** [http://localhost:5173](http://localhost:5173)

Ensure the frontend is configured to send API requests to the running backend.

## 🔑 Demo Accounts

Use the following dedicated assessment accounts to evaluate the application.

| Account        | Email           | Password      |
| -------------- | --------------- | ------------- |
| 👤 John Doe    | `john@staff.co` | `john$432`    |
| 👤 Ann Bennett | `Ann@staff.com` | `Ann Bennett` |

> 🔒 These credentials are for assessment use only. Do not use personal or production credentials.

## 🧪 Running Tests

### Backend Tests

```powershell
cd backend
npm test
```

### Frontend Tests

```powershell
cd frontend
npm test
```

The project uses Vitest for test execution, Supertest for backend HTTP testing, and React Testing Library for frontend component testing.

## 🗄️ Database Migrations

The Prisma schema and migration history are maintained in:

```text
backend/prisma/
```

Use the migrations committed to the repository to create or update the database structure. Avoid using development-only migration commands against a production database.

## 🔒 Security Notes

- 🔐 Passwords are stored as bcrypt hashes.
- 🛡️ Protected API routes require authentication.
- ✅ Backend validation is applied to inquiry submissions.
- 🚫 Keep `.env` files and secrets out of version control.
- 👥 Use dedicated demo accounts for assessment and demonstration.

## 🎯 Project Scope

This project was developed as a full-stack technical assessment, demonstrating frontend development, REST API implementation, relational database integration, authentication, validation, and automated testing.
