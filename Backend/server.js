import express from "express";
import dotenv from "dotenv";
import authRoute from "./Routes/auth.route.js";
import connectDB from "./Lib/db.js";
import cookieParser from "cookie-parser";
import userRoute from "./Routes/user.route.js";
import postRoute from "./Routes/post.route.js";
import notificationRouter from "./Routes/notification.route.js";
import connectionRoute from "./Routes/connection.route.js"
import cors from 'cors';
import path from "path";

const app=express()
dotenv.config()

const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
	app.use(
		cors({
			origin: "http://localhost:5173",
			credentials: true,
		})
	);
}
app.use(express.json({limit:"10mb"}))
app.use(cookieParser())
app.use("/api/v1/auth",authRoute)
app.use("/api/v1/users",userRoute)
app.use("/api/v1/posts",postRoute)
app.use("/api/v1/notifications",notificationRouter)
app.use("/api/v1/connections",connectionRoute)

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(process.env.PORT,()=>{
    console.log(`app is listening on the port ${process.env.PORT}`)
    connectDB()
})
