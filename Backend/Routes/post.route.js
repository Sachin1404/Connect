import express from "express";
import { protectionRoute } from "../Middlewares/auth.middleware.js";
import { comment, deleteComment, deletePost, getFeed, getPost, hitLike, upload, getMyFeed } from "../Controllers/post.controller.js";

const router=express.Router()
router.get("/",protectionRoute,getFeed)
router.get("/myposts",protectionRoute,getMyFeed)
router.post("/upload",protectionRoute,upload)
router.get("/:id",protectionRoute,getPost)
router.delete("/:id/delete",protectionRoute,deletePost)
router.post("/:id/like",protectionRoute,hitLike)
router.post("/:id/comment",protectionRoute,comment)
router.delete("/:postId/:commentId/delete",protectionRoute,deleteComment)

export default router;