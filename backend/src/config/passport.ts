import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import { ensureGmailSender } from "../models/sender.model";
import { upsertGoogleUser } from "../models/user.model";

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL,
            },
            async (_accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error("Google email unavailable"));
                    }

                    const name = profile.displayName || email;
                    const avatar = profile.photos?.[0]?.value ?? null;

                    const user = await upsertGoogleUser(
                        profile.id,
                        name,
                        email,
                        avatar,
                        refreshToken || null
                    );

                    // Every ReachInbox user gets one default Gmail sender.
                    // The actual Gmail authorization is stored on the user.
                    await ensureGmailSender(user.id, user.email);

                    if (!user.google_refresh_token) {
                        return done(
                            new Error(
                                "Gmail authorization was not granted. Please sign in with Google again and allow Gmail sending access."
                            )
                        );
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error);
                }
            }
        )
    );
}

export default passport;
