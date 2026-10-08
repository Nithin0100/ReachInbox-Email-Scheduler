import { Request, Response } from "express";
import { findUserById } from "../models/user.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const getCurrentUser = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const id = req.user?.id;

        if (!id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatar_url,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get current user",
        });
    }
};

export const logout = (
    req: Request,
    res: Response
) => {
    res.clearCookie("token");

    return res.json({
        success: true,
        message: "Logged out",
    });
};