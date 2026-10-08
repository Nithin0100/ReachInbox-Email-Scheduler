import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { findUserById } from "../models/user.model";

export type AuthenticatedRequest = Request;

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).json({
                message: "Authentication required",
            });
            return;
        }

        const decoded = jwt.verify(
            token,
            env.JWT_SECRET
        ) as {
            id: string;
        };

        const user = await findUserById(decoded.id);

        if (!user) {
            res.status(401).json({
                message: "User not found",
            });
            return;
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};