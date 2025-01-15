import express from "express";
import { acceptConnectionRequest, getConnectionRequests, getConnections, rejectConnectionRequest, removeConnection, sendConnectionRequest, getConnectionStatus } from "../Controllers/connection.controller.js";
import { protectionRoute } from "../Middlewares/auth.middleware.js";

const router=express.Router()
router.get("/",protectionRoute,getConnections)
router.delete("/:username/remove",protectionRoute,removeConnection)
router.get("/requests",protectionRoute,getConnectionRequests)
router.post("/requests/:username/send",protectionRoute,sendConnectionRequest)
router.put("/requests/:id/accept",protectionRoute,acceptConnectionRequest)
router.put("/requests/:id/reject",protectionRoute,rejectConnectionRequest)
router.get("/status/:userId", protectionRoute, getConnectionStatus);

export default router;