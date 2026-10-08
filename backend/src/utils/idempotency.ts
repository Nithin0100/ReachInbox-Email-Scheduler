import crypto from "crypto";
export const generateIdempotencyKey=(userId:string,senderId:string,recipient:string,scheduledAt:Date)=>crypto.createHash("sha256").update(`${userId}|${senderId}|${recipient}|${scheduledAt.toISOString()}`).digest("hex");
