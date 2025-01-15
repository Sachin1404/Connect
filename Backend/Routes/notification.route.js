import express from "express";
import { protectionRoute } from "../Middlewares/auth.middleware.js";
import { deleteNotification, getNotifications, readNotification } from "../Controllers/notification.controller.js";

const router=express.Router()
router.get("/",protectionRoute,getNotifications)
router.put("/:id",protectionRoute,readNotification)
router.delete("/:id/delete",protectionRoute,deleteNotification)

export default router;