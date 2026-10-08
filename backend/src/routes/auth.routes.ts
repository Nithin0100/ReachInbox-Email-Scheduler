import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { getCurrentUser, logout } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { env } from "../config/env";

const r = Router();

/**
 * Login + Gmail authorization.
 *
 * gmail.send allows ReachInbox to send mail as the Google account that the
 * user selected during this login flow.
 */
r.get(
    "/google",
    passport.authenticate("google", {
        scope: [
            "profile",
            "email",
            "https://www.googleapis.com/auth/gmail.send",
        ],
        accessType: "offline",
        prompt: "select_account consent",
        includeGrantedScopes: true,
        session: false,
    })
);

r.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/?error=google_auth_failed`,
    }),
    (req, res) => {
        const u = req.user as {
            id: string;
            email: string;
            name: string;
        };

        // Never put OAuth refresh tokens into the JWT.
        const token = jwt.sign(
            {
                id: u.id,
                email: u.email,
                name: u.name,
            },
            env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 604800000,
        });

        res.redirect(env.FRONTEND_URL);
    }
);

r.get("/me", authMiddleware, getCurrentUser);
r.post("/logout", logout);

export default r;
