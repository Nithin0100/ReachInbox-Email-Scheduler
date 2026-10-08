# ReachInbox — Email Scheduler

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-EF4444)](https://bullmq.io/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8-005571?logo=elasticsearch&logoColor=white)](https://www.elastic.co/elasticsearch/)

ReachInbox is a full-stack email scheduling and delivery platform. Users can authenticate using Google, schedule emails, upload recipient lists through CSV files, manage senders, search email records, and send emails through their authenticated Gmail account.

The platform uses background job processing with BullMQ and Redis, PostgreSQL for persistent data storage, Elasticsearch for email search, and the Gmail API for email delivery.

## Features

- Google OAuth 2.0 authentication
- Secure JWT-based authentication
- HTTP-only authentication cookies
- Gmail API integration
- Dynamic per-user Gmail sending
- Schedule emails for future delivery
- Send emails to multiple recipients
- CSV recipient upload
- BullMQ-based background email processing
- Redis-backed job queue
- Configurable delay between emails
- Configurable hourly email limits
- Automatic rate-limit rescheduling
- Email status tracking
- Failed email handling
- Idempotency protection
- PostgreSQL database
- Elasticsearch-powered email search
- Sender management
- Slack integration
- Bull Board queue monitoring
- Responsive dashboard

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **Queue:** BullMQ, Redis
- **Authentication:** Google OAuth 2.0, Passport.js, JWT
- **Email:** Gmail API, Nodemailer
- **Search:** Elasticsearch
- **File Processing:** Multer, CSV Parse
- **Notifications:** Slack
- **Queue Monitoring:** Bull Board

## Project Structure

```text
ReachInbox-Email-Scheduler/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   ├── passport.ts
│   │   │   ├── redis.ts
│   │   │   └── schema.sql
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── email.controller.ts
│   │   │   ├── sender.controller.ts
│   │   │   └── slack.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── models/
│   │   │   ├── email.model.ts
│   │   │   ├── sender.model.ts
│   │   │   ├── slack.model.ts
│   │   │   └── user.model.ts
│   │   ├── queue/
│   │   │   ├── email.queue.ts
│   │   │   └── email.worker.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── email.routes.ts
│   │   │   ├── sender.routes.ts
│   │   │   └── slack.routes.ts
│   │   ├── services/
│   │   │   ├── bull-board.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── gmail.service.ts
│   │   │   ├── migration.service.ts
│   │   │   ├── rate-limit.service.ts
│   │   │   ├── recovery.service.ts
│   │   │   ├── scheduler.service.ts
│   │   │   ├── search.service.ts
│   │   │   └── slack.service.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   ├── utils/
│   │   │   ├── csv.parser.ts
│   │   │   ├── idempotency.ts
│   │   │   └── logger.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComposeModal.tsx
│   │   │   ├── EmailTable.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Loading.tsx
│   │   ├── hooks/
│   │   │   └── useEmails.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Login.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── email.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

ReachInbox follows a full-stack asynchronous email scheduling architecture. The frontend handles user interaction, the backend manages authentication and email scheduling, PostgreSQL stores application data, Redis and BullMQ handle background jobs, and the email worker sends messages through the Gmail API.

### Overall Project Flow

```text
User
  │
  ▼
React Frontend
  │
  ▼
Google OAuth
  │
  ▼
Express Backend
  │
  ├──────────────► PostgreSQL
  │
  └──────────────► BullMQ
                      │
                      ▼
                    Redis
                      │
                      ▼
                 Email Worker
                      │
                      ▼
                  Gmail API
                      │
                      ▼
                  Recipient
```

## Current Project Status

ReachInbox is currently under active development.

The core email scheduling and delivery workflow is implemented, including:

- Google OAuth 2.0 authentication
- Gmail API integration
- Dynamic per-user Gmail sending
- Email scheduling
- CSV recipient upload
- BullMQ background processing
- Redis-based job queue
- PostgreSQL storage
- Elasticsearch search
- Rate limiting and automatic rescheduling
- Idempotency protection
- Sender management
- Slack integration
- Email status tracking
- Responsive React dashboard

### Current Environment

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Queue:** BullMQ + Redis
- **Search:** Elasticsearch
- **Authentication:** Google OAuth 2.0 + JWT
- **Email Delivery:** Gmail API

The project is currently configured for local development and testing. Production deployment would require production infrastructure, secure environment variables, Google OAuth production configuration, automated testing, monitoring, and deployment setup.
