import { Response } from "express";

import {
    getSlackAuthUrl,
    handleSlackCallback,
    disconnectSlackForUser,
} from "../services/slack.service";

import { env } from "../config/env";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const connectSlack = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user!.id;

    return res.json({
        success: true,
        authUrl: await getSlackAuthUrl(userId),
    });
};

export const slackCallback = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        await handleSlackCallback(
            String(req.query.code),
            String(req.query.state)
        );

        return res.redirect(
            `${env.FRONTEND_URL}/dashboard?slack=connected`
        );
    } catch (error) {
        console.error(error);

        return res.redirect(
            `${env.FRONTEND_URL}/dashboard?slack=error`
        );
    }
};

export const disconnectSlackController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user!.id;

    await disconnectSlackForUser(userId);

    return res.json({
        success: true,
        message: "Slack disconnected",
    });
};