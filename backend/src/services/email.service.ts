import { pool } from "../config/database";
import { emailQueue } from "../queue/email.queue";
import { indexEmail } from "./search.service";
import { scheduledTime } from "./scheduler.service";
import { generateIdempotencyKey } from "../utils/idempotency";
import { ensureGmailSender } from "../models/sender.model";
import { findUserById } from "../models/user.model";
import { env } from "../config/env";

interface Input {
    userId: string;
    subject: string;
    body: string;
    recipients: string[];
    startTime: string;
    delayBetweenEmails: number;
    hourlyLimit: number;
}

export const scheduleEmails = async (input: Input) => {
    const start = new Date(input.startTime);

    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
        throw new Error("Start time must be in the future");
    }

    if (input.hourlyLimit <= 0) {
        throw new Error("Hourly limit must be greater than 0");
    }

    if (!input.subject.trim()) {
        throw new Error("Subject is required");
    }

    if (!input.body.trim()) {
        throw new Error("Email body is required");
    }

    const delay = Math.max(
        input.delayBetweenEmails,
        env.MIN_EMAIL_DELAY_MS
    );

    // The sender is always the Google account that authenticated this user.
    // This prevents one logged-in user from sending through another sender.
    const user = await findUserById(input.userId);

    if (!user) {
        throw new Error("Authenticated user not found");
    }

    if (!user.google_refresh_token) {
        throw new Error(
            "Gmail authorization is missing. Please sign in with Google again and allow Gmail sending access."
        );
    }

    const sender = await ensureGmailSender(input.userId, user.email);

    const client = await pool.connect();
    const created: any[] = [];

    try {
        await client.query("BEGIN");

        for (let i = 0; i < input.recipients.length; i++) {
            const recipient = input.recipients[i].trim().toLowerCase();
            if (!recipient) continue;

            const scheduledAt = scheduledTime(start, i, delay);
            const idempotencyKey = generateIdempotencyKey(
                input.userId,
                sender.id,
                recipient,
                scheduledAt
            );

            const result = await client.query(
                `
                INSERT INTO emails
                  (user_id, sender_id, recipient, subject, body, scheduled_at,
                   status, idempotency_key, hourly_limit)
                VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8)
                ON CONFLICT (idempotency_key) DO NOTHING
                RETURNING
                  id,
                  user_id,
                  sender_id,
                  recipient,
                  subject,
                  body,
                  scheduled_at,
                  status
                `,
                [
                    input.userId,
                    sender.id,
                    recipient,
                    input.subject.trim(),
                    input.body,
                    scheduledAt,
                    idempotencyKey,
                    input.hourlyLimit,
                ]
            );

            if (result.rows.length === 0) continue;
            created.push(result.rows[0]);
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

    // Queueing happens after DB commit. Startup recovery recreates missing jobs.
    for (const email of created) {
        const jobId = `email:${email.id}:0`;

        await emailQueue.add(
            "send-email",
            {
                emailId: email.id,
                hourlyLimit: input.hourlyLimit,
            },
            {
                jobId,
                delay: Math.max(
                    0,
                    new Date(email.scheduled_at).getTime() - Date.now()
                ),
            }
        );

        await pool.query(
            "UPDATE emails SET bullmq_job_id=$1, updated_at=NOW() WHERE id=$2",
            [jobId, email.id]
        );

        await indexEmail({
            id: email.id,
            userId: input.userId,
            recipient: email.recipient,
            subject: email.subject,
            body: email.body,
            status: "scheduled",
            scheduledAt: new Date(email.scheduled_at).toISOString(),
            sentAt: null,
        });
    }

    return created;
};

export const listScheduled = async (userId: string) => {
    const result = await pool.query(
        `
        SELECT
          id,
          user_id AS "userId",
          sender_id AS "senderId",
          recipient,
          subject,
          body,
          scheduled_at AS "scheduledAt",
          status,
          hourly_limit AS "hourlyLimit"
        FROM emails
        WHERE user_id=$1 AND status='scheduled'
        ORDER BY scheduled_at ASC
        `,
        [userId]
    );

    return result.rows;
};

export const listSent = async (userId: string) => {
    const result = await pool.query(
        `
        SELECT
          id,
          user_id AS "userId",
          sender_id AS "senderId",
          recipient,
          subject,
          body,
          sent_at AS "sentAt",
          status
        FROM emails
        WHERE user_id=$1 AND status IN ('sent','failed')
        ORDER BY COALESCE(sent_at, updated_at) DESC
        `,
        [userId]
    );

    return result.rows;
};
