import { Email, ScheduleEmailRequest, User } from "../types/email";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface ApiListResponse<T> {
    success: boolean;
    data: T;
}

export interface ScheduleEmailResponse {
    success: boolean;
    count: number;
    data: Email[];
}

export interface Sender {
    id: string;
    user_id?: string;
    email: string;
    smtp_host: string;
    smtp_port: number;
    smtp_user?: string;
}

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof data === "object" && data?.message
                ? data.message
                : "Something went wrong.";
        throw new Error(message);
    }

    return data as T;
};

export const getCurrentUser = async () =>
    request<{ success: boolean; user: User }>("/api/auth/me");

export const logout = async () =>
    request<{ success: boolean; message: string }>("/api/auth/logout", {
        method: "POST",
    });

export const getGoogleLoginUrl = () => `${API_URL}/api/auth/google`;

export const getScheduledEmails = async () =>
    request<ApiListResponse<Email[]>>("/api/emails/scheduled");

export const getSentEmails = async () =>
    request<ApiListResponse<Email[]>>("/api/emails/sent");

export const searchEmails = async (query: string) =>
    request<ApiListResponse<Email[]>>(
        `/api/emails/search?q=${encodeURIComponent(query)}`
    );

export const scheduleEmails = async (
    data: ScheduleEmailRequest
): Promise<ScheduleEmailResponse> => {
    const formData = new FormData();

    if (data.recipients?.length) {
        formData.append("recipients", JSON.stringify(data.recipients));
    }

    formData.append("subject", data.subject);
    formData.append("body", data.body);
    formData.append("startTime", data.startTime);
    formData.append("delayBetweenEmails", String(data.delayBetweenEmails ?? 2000));
    formData.append("hourlyLimit", String(data.hourlyLimit ?? 100));

    if (data.file) {
        formData.append("file", data.file);
    }

    return request<ScheduleEmailResponse>("/api/emails/schedule", {
        method: "POST",
        body: formData,
    });
};

export const getSenders = async () =>
    request<ApiListResponse<Sender[]>>("/api/senders");

export const createSender = async (sender: {
    email: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
}) =>
    request("/api/senders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sender),
    });

export const getSlackConnectUrl = () => `${API_URL}/api/slack/connect`;

export const disconnectSlack = async () =>
    request("/api/slack/disconnect", { method: "POST" });

export const getHealth = async () =>
    request<{ success: boolean; message: string }>("/api/health");

export default {
    getCurrentUser,
    logout,
    getGoogleLoginUrl,
    getScheduledEmails,
    getSentEmails,
    searchEmails,
    scheduleEmails,
    getSenders,
    createSender,
    getSlackConnectUrl,
    disconnectSlack,
    getHealth,
};
