import { pool } from "../config/database";

export interface User {
    id: string;
    google_id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    google_refresh_token: string | null;
}

/**
 * Create/update the ReachInbox user from the Google OAuth profile.
 *
 * The refresh token is intentionally preserved when Google does not return
 * one on a later login. Google commonly returns a refresh token only when
 * the user grants consent for the first time (or when consent is forced).
 */
export const upsertGoogleUser = async (
    googleId: string,
    name: string,
    email: string,
    avatarUrl: string | null,
    refreshToken: string | null
): Promise<User> => {
    const result = await pool.query(
        `
        INSERT INTO users (
            google_id,
            name,
            email,
            avatar_url,
            google_refresh_token
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (google_id)
        DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url,
            google_refresh_token = COALESCE(
                EXCLUDED.google_refresh_token,
                users.google_refresh_token
            ),
            updated_at = NOW()
        RETURNING
            id,
            google_id,
            name,
            email,
            avatar_url,
            google_refresh_token
        `,
        [googleId, name, email, avatarUrl, refreshToken]
    );

    return result.rows[0];
};

export const findUserByGoogleId = async (
    googleId: string
): Promise<User | null> => {
    const result = await pool.query(
        `
        SELECT
            id,
            google_id,
            name,
            email,
            avatar_url,
            google_refresh_token
        FROM users
        WHERE google_id = $1
        `,
        [googleId]
    );

    return result.rows[0] ?? null;
};

export const findUserById = async (
    id: string
): Promise<User | null> => {
    const result = await pool.query(
        `
        SELECT
            id,
            google_id,
            name,
            email,
            avatar_url,
            google_refresh_token
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0] ?? null;
};
