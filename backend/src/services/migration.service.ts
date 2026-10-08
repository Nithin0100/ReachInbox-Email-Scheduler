import fs from "fs/promises";
import path from "path";
import { pool } from "../config/database";

export const migrate = async (): Promise<void> => {
  const file = path.join(process.cwd(), "src", "config", "schema.sql");
  const sql = await fs.readFile(file, "utf8");
  await pool.query(sql);
  console.log("✅ Database schema ready");
};
