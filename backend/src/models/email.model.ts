import { pool } from "../config/database";
export const getEmail=async(id:string)=>{const r=await pool.query("SELECT * FROM emails WHERE id=$1",[id]);return r.rows[0]??null;};
export const claimEmail=async(id:string)=>{const r=await pool.query("UPDATE emails SET status='processing',updated_at=NOW() WHERE id=$1 AND status='scheduled' RETURNING id",[id]);return r.rowCount===1;};
export const releaseEmail=async(id:string)=>{await pool.query("UPDATE emails SET status='scheduled',updated_at=NOW() WHERE id=$1 AND status='processing'",[id]);};
export const markSent=async(id:string,messageId:string)=>{await pool.query("UPDATE emails SET status='sent',sent_at=NOW(),message_id=$1,updated_at=NOW() WHERE id=$2",[messageId,id]);};
export const markFailed=async(id:string)=>{await pool.query("UPDATE emails SET status='failed',updated_at=NOW() WHERE id=$1",[id]);};
