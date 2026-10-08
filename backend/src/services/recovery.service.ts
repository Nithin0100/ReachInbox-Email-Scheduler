import { pool } from "../config/database";
import { emailQueue } from "../queue/email.queue";

export const recoverScheduledJobs = async (): Promise<void> => {
  const result = await pool.query(`
    SELECT id, scheduled_at, bullmq_job_id, hourly_limit
    FROM emails
    WHERE status = 'scheduled'
    ORDER BY scheduled_at ASC
  `);

  let recovered = 0;

  for (const email of result.rows) {
    const jobId = email.bullmq_job_id || `email:${email.id}:0`;
    const existing = await emailQueue.getJob(jobId);

    if (existing) continue;

    await emailQueue.add(
      "send-email",
      { emailId: email.id, hourlyLimit: email.hourly_limit },
      {
        jobId,
        delay: Math.max(0, new Date(email.scheduled_at).getTime() - Date.now()),
      }
    );

    await pool.query(
      "UPDATE emails SET bullmq_job_id=$1, updated_at=NOW() WHERE id=$2",
      [jobId, email.id]
    );

    recovered++;
  }

  if (recovered > 0) {
    console.log(`♻️ Recovered ${recovered} scheduled jobs`);
  }
};
