# Architecture – Job Importer System

This document outlines the system architecture, design decisions, and flow for the Scalable Job Importer System project.

---

## 1. Project Structure

/client → Frontend: Next.js (Admin UI)
/server → Backend: Express.js + MongoDB + Redis
/docs → Architecture explanation

---

## 2. Tech Stack & Tools

| Layer              | Tech Used                                                       |
| ------------------ | --------------------------------------------------------------- |
| Frontend           | Next.js (TypeScript, Tailwind CSS)                              |
| Backend            | Node.js + Express                                               |
| Queue              | Redis + Bull                                                    |
| Database           | MongoDB (Mongoose)                                              |
| Scheduling         | node-cron                                                       |
| XML Parsing        | xml2js                                                          |
| API                | Public XML Job Feeds                                            |
| Hosting (Optional) | Render (Backend), Vercel (Frontend), MongoDB Atlas, Redis Cloud |

---

## 3. System Flow

1. **Cron job** triggers every 1 hour (or manual API hit).
2. It fetches XML job data from multiple job APIs.
3. XML is parsed to JSON using `xml2js`.
4. Each job is added to a **Bull queue** (`job-import-queue`).
5. Background worker processes jobs:
   - Inserts or updates job records in MongoDB.
6. For every import run, a summary is stored in `import_logs` collection.
7. Frontend (Next.js) fetches and displays import logs in a table format.

---

## 4. Collections Used

### `jobs`

Stores job listings with fields:

- jobId
- title
- company
- description
- location
- jobType
- publishedAt

### `import_logs`

Stores import history:

- fileName (feed URL)
- timestamp
- totalFetched
- newJobs
- updatedJobs
- failedJobs (with reason)

---

## 5. Design Decisions

- Used `Bull` over `kue/Agenda` for more control & Redis support.
- Used `node-cron` for simple and fast periodic imports.
- `xml2js` to convert RSS/XML feeds to usable JSON.
- Maintained clean code with folders: `services`, `models`, `queues`, `workers`.
- Used `upsert` to handle both new & updated job records.
- Used `.env` file for environment-specific configs.

---

## 6. Error Handling

- All XML fetch & parsing wrapped in `try-catch`
- Failed job entries are pushed into `failedJobs` array in import logs
- Redis queue jobs are retryable (Bull has built-in retry support)

---

## 7. Scalability

- Workers can be scaled horizontally.
- Queue concurrency can be adjusted via Bull settings.
- Feeds are modular — new URLs can be added easily.
- Can evolve into a microservice architecture if split into:
  - Import Service
  - Queue Service
  - Frontend Service

---

## 8. Testing & Monitoring

- API tested using Postman
- Logs observed via terminal and MongoDB Compass
- Cron logs visible in console for every run

---

## 9. Bonus Points Implemented

- [x] Cron-based auto imports
- [x] Error handling with failed jobs tracking
- [x] Clean project structure
- [x] Real-time import history viewing (Next.js)
- [ ] Retry logic with exponential backoff (optional)
- [ ] Real-time updates via Socket.IO (optional)

---

## 10. Architecture Diagram (Optional)

You can draw using [draw.io](https://draw.io) or [excalidraw.com](https://excalidraw.com)

---

## 11. Contributors

- Sunil Sharma – Full Stack Developer (MERN)
