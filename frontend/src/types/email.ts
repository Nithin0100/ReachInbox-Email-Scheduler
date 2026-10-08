export type EmailStatus = "scheduled" | "processing" | "sent" | "failed";

export interface Email {
    id: string;
    userId?: string;
    recipient: string;
    subject: string;
    body?: string;
    status: EmailStatus;
    scheduledAt?: string;
    sentAt?: string;
    hourlyLimit?: number;
    delayBetweenEmails?: number;
    bullmqJobId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ScheduleEmailRequest {
    recipients?: string[];
    subject: string;
    body: string;
    startTime: string;
    delayBetweenEmails?: number;
    hourlyLimit?: number;
    file?: File;
}

export interface Sender {
    id: string;
    userId?: string;
    email: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
}
