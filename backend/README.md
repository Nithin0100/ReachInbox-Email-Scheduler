# ReachInbox Backend

## Run

1. Copy `.env.example` to `.env` and fill the Google OAuth, database, Redis, JWT and optional Slack values.
2. Make sure PostgreSQL, Redis and Elasticsearch are running locally.
3. From `backend`, run `npm install` and then `npm run dev`.

Bull Board: http://localhost:5001/admin/queues
Health: http://localhost:5001/api/health

## Gmail sending

ReachInbox uses the Google account selected during **Continue with Google** as the sender.

The OAuth flow requests the Gmail `gmail.send` permission and stores the user's Google refresh token server-side. Scheduled jobs use that user's token to call the Gmail API, so different ReachInbox users send from their own Google accounts.

No global `GMAIL_SMTP_USER` or `GMAIL_SMTP_PASSWORD` is required.

Before testing:

- Enable the Gmail API in the same Google Cloud project as the OAuth client.
- Keep `http://localhost:5001/api/auth/google/callback` as the authorized redirect URI.
- For an OAuth app in testing mode, add the Gmail accounts you want to test as test users in the OAuth consent configuration.

No cron is used. BullMQ delayed jobs are persisted in Redis. PostgreSQL is the source of truth and startup reconciliation restores scheduled jobs that are missing from BullMQ.
