import express from "express";
import { login, logOut } from "../controllers/auth.controllers.ts";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logOut);
export default router;
