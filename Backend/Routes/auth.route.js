import express from "express";
import { signup, login, logout, getCurrentUser } from "../Controllers/auth.controller.js";
import { protectionRoute } from "../Middlewares/auth.middleware.js";

const router=express.Router()
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.get("/me",protectionRoute,getCurrentUser)

export default router;