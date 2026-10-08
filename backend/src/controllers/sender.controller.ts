import { Response } from "express";
import { createSender, listSenders } from "../models/sender.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const publicSender = (sender: any) => ({
    id: sender.id,
    user_id: sender.user_id,
    email: sender.email,
    smtp_host: sender.smtp_host,
    smtp_port: sender.smtp_port,
    smtp_user: sender.smtp_user,
    auth_type: sender.auth_type,
});

export const getSenders = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user!.id;
        const senders = await listSenders(userId);

        return res.json({
            success: true,
            data: senders,
        });
    } catch (error) {
        console.error("Get senders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get senders",
        });
    }
};

/**
 * Optional manual SMTP sender endpoint.
 * The main application uses the logged-in Google account automatically.
 */
export const addSender = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const {
            email,
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPassword,
        } = req.body;

        if (
            !email ||
            !smtpHost ||
            !smtpPort ||
            !smtpUser ||
            !smtpPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All sender SMTP fields are required",
            });
        }

        const sender = await createSender(
            req.user!.id,
            email,
            smtpHost,
            Number(smtpPort),
            smtpUser,
            smtpPassword
        );

        return res.status(201).json({
            success: true,
            data: publicSender(sender),
        });
    } catch (error) {
        console.error("Add sender error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to add sender",
        });
    }
};
