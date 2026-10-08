import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { redisConnection } from "./config/redis";
import { migrate } from "./services/migration.service";
import { recoverScheduledJobs } from "./services/recovery.service";
import "./queue/email.worker";

const start = async () => {
    try {
        // -----------------------------------------
        // PostgreSQL
        // -----------------------------------------
        await connectDatabase();
        console.log("✅ PostgreSQL connected");

        // -----------------------------------------
        // Database migration
        // -----------------------------------------
        await migrate();
        console.log("✅ Database schema ready");

        // -----------------------------------------
        // Redis
        // -----------------------------------------
        await redisConnection.ping();
        console.log("✅ Redis ready");

        // -----------------------------------------
        // Recover scheduled jobs
        // -----------------------------------------
        await recoverScheduledJobs();
        console.log("✅ Scheduled jobs recovered");

        // -----------------------------------------
        // Start Express server
        // -----------------------------------------
        app.listen(env.PORT, () => {
            console.log(`🚀 http://localhost:${env.PORT}`);
        });

    } catch (error) {
        console.error("❌ Startup failed:", error);
        process.exit(1);
    }
};

void start();