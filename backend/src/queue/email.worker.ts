import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { env } from "../config/env";
import { emailQueue } from "./email.queue";

import {
    claimEmail,
    getEmail,
    markFailed,
    markSent,
    releaseEmail
} from "../models/email.model";

import { findSenderById } from "../models/sender.model";

import {
    consumeHourlySlot,
    reserveSendSlot,
    markRateLimitNotification
} from "../services/rate-limit.service";

import { notifyRateLimit } from "../services/slack.service";
import { updateEmailIndex } from "../services/search.service";
import { findUserById } from "../models/user.model";
import { sendGmail } from "../services/gmail.service";


// ======================================================
// JOB DATA
// ======================================================

interface Data {
    emailId: string;
    hourlyLimit: number;
    attempt?: number;
}


// ======================================================
// SLEEP FUNCTION
// ======================================================

const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));


// ======================================================
// EMAIL PROCESSOR
// ======================================================

const processEmail = async (job: Job<Data>) => {

    // --------------------------------------------------
    // 1. Get email from database
    // --------------------------------------------------

    const email = await getEmail(job.data.emailId);

    if (!email) {
        console.log(`⚠️ Email not found: ${job.data.emailId}`);
        return;
    }


    // --------------------------------------------------
    // 2. Don't send already sent emails
    // --------------------------------------------------

    if (email.status === "sent") {
        console.log(`ℹ️ Email already sent: ${email.id}`);
        return;
    }


    // --------------------------------------------------
    // 3. Claim email
    // --------------------------------------------------

    const claimed = await claimEmail(email.id);

    if (!claimed) {
        console.log(`ℹ️ Email already being processed: ${email.id}`);
        return;
    }


    // --------------------------------------------------
    // 4. Find sender
    // --------------------------------------------------

    const sender = await findSenderById(
        email.sender_id,
        email.user_id
    );

    if (!sender) {

        await markFailed(email.id);

        throw new Error("Sender not found");
    }


    // --------------------------------------------------
    // 5. Hourly rate limit
    // --------------------------------------------------

    const limit =
        job.data.hourlyLimit ||
        env.MAX_EMAILS_PER_HOUR;

    const rate = await consumeHourlySlot(
        sender.id,
        limit
    );


    // --------------------------------------------------
    // 6. Rate limit reached
    // --------------------------------------------------

    if (!rate.allowed) {

        await releaseEmail(email.id);


        // Slack notification
        if (
            await markRateLimitNotification(
                sender.id
            )
        ) {

            try {

                await notifyRateLimit(
                    email.user_id,
                    sender.id,
                    limit
                );

            } catch (err) {

                console.error(
                    "⚠️ Slack notification failed:",
                    err
                );
            }
        }


        // Schedule another attempt
        const nextAttempt =
            (job.data.attempt ?? 0) + 1;


        await emailQueue.add(
            "send-email",
            {
                emailId: email.id,
                hourlyLimit: limit,
                attempt: nextAttempt
            },
            {
                jobId: `email:${email.id}:${nextAttempt}`,

                delay: Math.max(
                    1000,
                    rate.retryAt.getTime() - Date.now()
                ),

                removeOnComplete: {
                    age: 86400
                },

                removeOnFail: {
                    age: 604800
                }
            }
        );


        console.log(
            `⏳ Rate limit reached. Email ${email.id} rescheduled.`
        );

        return;
    }


    // --------------------------------------------------
    // 7. Minimum delay between emails
    // --------------------------------------------------

    const wait = await reserveSendSlot(
        sender.id,
        env.MIN_EMAIL_DELAY_MS
    );

    if (wait > 0) {
        await sleep(wait);
    }


    // ==================================================
    // GOOGLE OAUTH / GMAIL API
    // ==================================================

    const user = await findUserById(email.user_id);

    if (!user) {
        await markFailed(email.id);
        throw new Error("User not found for scheduled email");
    }

    if (!user.google_refresh_token) {
        await markFailed(email.id);
        await updateEmailIndex(email.id, { status: "failed" });
        throw new Error(
            "Gmail authorization is missing. The user must sign in with Google again and grant Gmail sending access."
        );
    }

    // ==================================================
    // SEND EMAIL
    // ==================================================

    try {

        console.log(
            `📧 Sending email to ${email.recipient}...`
        );


        const info = await sendGmail({
            userId: user.id,
            refreshToken: user.google_refresh_token,
            from: user.email,
            to: email.recipient,
            subject: email.subject,
            text: email.body,
        });


        // ------------------------------------------------
        // Mark email as sent
        // ------------------------------------------------

        await markSent(
            email.id,
            info.messageId
        );


        // ------------------------------------------------
        // Update Elasticsearch
        // ------------------------------------------------

        await updateEmailIndex(
            email.id,
            {
                status: "sent",
                sentAt: new Date().toISOString()
            }
        );


        console.log(
            `✅ Gmail sent successfully → ${email.recipient}`
        );

        console.log(
            `📨 Message ID: ${info.messageId}`
        );


    } catch (error) {

        // ------------------------------------------------
        // Mark failed
        // ------------------------------------------------

        await markFailed(email.id);


        await updateEmailIndex(
            email.id,
            {
                status: "failed"
            }
        );


        console.error(
            `❌ Failed to send email to ${email.recipient}`
        );

        console.error(error);


        throw error;


    }
};


// ======================================================
// BULLMQ WORKER
// ======================================================

export const emailWorker =
    new Worker<Data>(
        "email-queue",
        processEmail,
        {
            connection: redisConnection,

            concurrency:
                env.WORKER_CONCURRENCY
        }
    );


// ======================================================
// JOB COMPLETED
// ======================================================

emailWorker.on(
    "completed",
    (job) => {

        console.log(
            `✅ Job completed: ${job.id}`
        );
    }
);


// ======================================================
// JOB FAILED
// ======================================================

emailWorker.on(
    "failed",
    (job, error) => {

        console.error(
            `❌ Job failed: ${job?.id}`
        );

        console.error(error);
    }
);