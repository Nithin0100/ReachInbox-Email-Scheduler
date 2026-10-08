import { Response } from "express";
import { scheduleEmails, listScheduled, listSent } from "../services/email.service";
import { parseEmailLeads } from "../utils/csv.parser";
import { searchEmails } from "../services/search.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const scheduleEmail = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user!.id;

        let recipients: string[] = [];

        if (req.file) {
            recipients = parseEmailLeads(
                req.file.buffer.toString("utf8")
            );
        } else if (Array.isArray(req.body.recipients)) {
            recipients = req.body.recipients;
        } else if (typeof req.body.recipients === "string") {
            recipients = JSON.parse(req.body.recipients);
        }

        if (!recipients.length) {
            return res.status(400).json({
                success: false,
                message: "No valid email recipients found",
            });
        }

        const result = await scheduleEmails({
            userId,
            subject: req.body.subject,
            body: req.body.body,
            recipients,
            startTime: req.body.startTime,
            delayBetweenEmails: Number(
                req.body.delayBetweenEmails ?? 2000
            ),
            hourlyLimit: Number(
                req.body.hourlyLimit ?? 100
            ),
        });

        return res.status(201).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to schedule emails",
        });
    }
};

export const getScheduled = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user!.id;

    return res.json({
        success: true,
        data: await listScheduled(userId),
    });
};

export const getSent = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user!.id;

    return res.json({
        success: true,
        data: await listSent(userId),
    });
};

export const search = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const q = String(req.query.q ?? "").trim();

    if (!q) {
        return res.status(400).json({
            success: false,
            message: "q is required",
        });
    }

    const userId = req.user!.id;

    return res.json({
        success: true,
        data: await searchEmails(userId, q),
    });
};