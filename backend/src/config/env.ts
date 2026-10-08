import dotenv from "dotenv";
dotenv.config();

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL ?? "http://localhost:9200",
  WORKER_CONCURRENCY: Number(process.env.WORKER_CONCURRENCY ?? 5),
  MIN_EMAIL_DELAY_MS: Number(process.env.MIN_EMAIL_DELAY_MS ?? 2000),
  MAX_EMAILS_PER_HOUR: Number(process.env.MAX_EMAILS_PER_HOUR ?? 100),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:5001/api/auth/google/callback",
  JWT_SECRET: required("JWT_SECRET"),
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID ?? "",
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET ?? "",
  SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI ?? "http://localhost:5001/api/slack/callback"
};
