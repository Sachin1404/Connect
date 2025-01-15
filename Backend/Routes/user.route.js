import express from "express";
import { protectionRoute } from "../Middlewares/auth.middleware.js";
import { getSuggestions, getProfile, updateProfile, getUserConnections } from "../Controllers/user.controller.js";

const router=express.Router()
router.get("/suggestions",protectionRoute,getSuggestions)
router.get("/:username",protectionRoute,getProfile)
router.put("/profile",protectionRoute,updateProfile)
router.get("/:username/connections",protectionRoute,getUserConnections)

export default router;