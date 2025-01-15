import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

export const protectionRoute=async(req,res,next)=>{
    try {
        const token=req.cookies["linkedin-token"]
        if(!token){
            return res.status(401).json({message:"Unauthorised access:token not found!"})
        }
        const decodedToken=jwt.verify(token,process.env.JWT_SECRET)
        if(!decodedToken){
            return res.status(401).json({message:"Unauthorised access:invalid token!"})
        }
        const user=await User.findById(decodedToken.UserId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found!"})
        }
        req.user=user
        next()
    } catch (error) {
        console.log(`Error in protectionRoute:${error.message}`)
        res.status(500).json({message:"Internal server error"})
    }
}