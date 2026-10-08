import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { addSender, getSenders } from "../controllers/sender.controller";
const router = Router();
router.get("/", authMiddleware, getSenders);
router.post("/", authMiddleware, addSender);
export default router;
