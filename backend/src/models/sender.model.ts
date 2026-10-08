import { pool } from "../config/database";

export type SenderAuthType = "smtp" | "oauth2";

export interface Sender {
    id: string;
    user_id: string;
    email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string | null;
    auth_type: SenderAuthType;
}

export const findSenderById = async (
    id: string,
    userId: string
): Promise<Sender | null> => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            email,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_password,
            auth_type
        FROM senders
        WHERE id = $1 AND user_id = $2
        `,
        [id, userId]
    );

    return result.rows[0] ?? null;
};

/**
 * Returns only non-secret sender information for the frontend.
 * SMTP passwords must never be sent back to the browser.
 */
export const listSenders = async (userId: string) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            email,
            smtp_host,
            smtp_port,
            smtp_user,
            auth_type
        FROM senders
        WHERE user_id = $1
        ORDER BY
            CASE WHEN auth_type = 'oauth2' THEN 0 ELSE 1 END,
            created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

/**
 * Optional manual SMTP sender support.
 */
export const createSender = async (
    userId: string,
    email: string,
    host: string,
    port: number,
    user: string,
    password: string
): Promise<Sender> => {
    const result = await pool.query(
        `
        INSERT INTO senders (
            user_id,
            email,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_password,
            auth_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'smtp')
        RETURNING *
        `,
        [userId, email, host, port, user, password]
    );

    return result.rows[0];
};

/**
 * Creates/updates the sender record associated with the Google account that
 * is currently logged in. No Gmail password is stored here; OAuth tokens are
 * stored on the user record instead.
 */
export const ensureGmailSender = async (
    userId: string,
    email: string
): Promise<Sender> => {
    const result = await pool.query(
        `
        INSERT INTO senders (
            user_id,
            email,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_password,
            auth_type
        )
        VALUES ($1, $2, 'smtp.gmail.com', 587, $2, NULL, 'oauth2')
        ON CONFLICT (user_id, email)
        DO UPDATE SET
            smtp_host = 'smtp.gmail.com',
            smtp_port = 587,
            smtp_user = EXCLUDED.smtp_user,
            smtp_password = NULL,
            auth_type = 'oauth2'
        RETURNING *
        `,
        [userId, email]
    );

    return result.rows[0];
};
