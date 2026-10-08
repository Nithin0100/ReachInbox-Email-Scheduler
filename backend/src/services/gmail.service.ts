import { env } from "../config/env";

interface GoogleTokenResponse {
    access_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
}

interface TokenCacheEntry {
    accessToken: string;
    expiresAt: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

const cleanHeader = (value: string) =>
    value.replace(/[\r\n]/g, " ").trim();

const encodeSubject = (subject: string) => {
    const cleaned = cleanHeader(subject);

    if (/^[\x00-\x7F]*$/.test(cleaned)) {
        return cleaned;
    }

    const encoded = Buffer.from(cleaned, "utf8").toString("base64");
    return `=?UTF-8?B?${encoded}?=`;
};

const base64UrlEncode = (value: string) =>
    Buffer.from(value, "utf8").toString("base64url");

const getAccessToken = async (
    userId: string,
    refreshToken: string
): Promise<string> => {
    const cached = tokenCache.get(userId);

    // Keep a small safety window so an access token is not used right before expiry.
    if (cached && cached.expiresAt > Date.now() + 60_000) {
        return cached.accessToken;
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }).toString(),
    });

    const data = (await response.json()) as Partial<GoogleTokenResponse> & {
        error?: string;
        error_description?: string;
    };

    if (!response.ok || !data.access_token) {
        tokenCache.delete(userId);

        const description =
            data.error_description ||
            data.error ||
            "Google did not return an access token";

        throw new Error(
            `Google authorization failed for this account: ${description}. Please sign in with Google again.`
        );
    }

    const expiresIn = Number(data.expires_in ?? 3600);

    tokenCache.set(userId, {
        accessToken: data.access_token,
        expiresAt: Date.now() + expiresIn * 1000,
    });

    return data.access_token;
};

export const sendGmail = async (input: {
    userId: string;
    refreshToken: string;
    from: string;
    to: string;
    subject: string;
    text: string;
}) => {
    const accessToken = await getAccessToken(input.userId, input.refreshToken);

    const from = cleanHeader(input.from);
    const to = cleanHeader(input.to);
    const subject = encodeSubject(input.subject);

    const rawMessage = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        input.text,
    ].join("\r\n");

    const response = await fetch(GMAIL_SEND_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            raw: base64UrlEncode(rawMessage),
        }),
    });

    const data = (await response.json()) as {
        id?: string;
        threadId?: string;
        labelIds?: string[];
        error?: {
            message?: string;
            status?: string;
        };
    };

    if (!response.ok || !data.id) {
        if (response.status === 401) {
            tokenCache.delete(input.userId);
        }

        throw new Error(
            data.error?.message ||
            `Gmail API failed with HTTP ${response.status}`
        );
    }

    return {
        messageId: data.id,
        threadId: data.threadId,
    };
};

export const clearGmailTokenCache = (userId: string) => {
    tokenCache.delete(userId);
};
