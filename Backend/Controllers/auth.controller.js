import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../Email/emailsend.js";

export const signup = async (req,res) => {
    try {
        const {name,username,email,password}=req.body

    // Handling Errors
    if(!username || !name || !email || !password){
        return res.status(400).json({message:"all fields are required!"})
    }
    const existingUsername=await User.findOne({username})
    if(existingUsername){
        return res.status(400).json({message:"username already exists!"})
    }
    const existingEmail=await User.findOne({email})
    if(existingEmail){
        return res.status(400).json({message:"email already registered!"})
    }
    if(password.length<8){
        return res.status(400).json({message:"password must be atleast 8 characters!"})
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10)
    const hashedpass = await bcrypt.hash(password,salt) 

    // Saving in DB
    const user=new User({
        name,
        username,
        email,
        password:hashedpass
    })
    await user.save()

    // Generating jwt token and sending it through cookie
    const token=jwt.sign({UserId:user._id},process.env.JWT_SECRET,{expiresIn:"4d"})
    res.cookie("linkedin-token",token,{
            httpOnly: true, // prevent XSS attack
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
    })
    return res.status(201).json({message:"user successfully registered!"})
    // Mailtrap
    // const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

	// 	try {
	// 		await sendWelcomeEmail(user.email, user.name, profileUrl);
	// 	} catch (emailError) {
	// 		console.error("Error sending welcome Email", emailError);
	// 	}
    } catch (error) {
        console.log(`Error in signup:${error.message}`)
        res.status(500).json({message:"Internal server error"})
    }
}


export const login = async (req,res) => {
    try {
        const {username,password}=req.body

        //Check credentials
        const user=await User.findOne({username})
        if(!user){
            return res.status(400).json({message:"username not found!"})
        }
        const isCorrect=await bcrypt.compare(password,user.password)
        if(!isCorrect){
            return res.status(400).json({message:"wrong password!"})
        }

        //Generate token
        const token=jwt.sign({UserId:user._id},process.env.JWT_SECRET,{expiresIn:"4d"})
        res.cookie("linkedin-token",token,{
            httpOnly: true, // prevent XSS attack
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict", // prevent CSRF attacks,
			secure: process.env.NODE_ENV === "production",
        })
        return res.status(201).json({message:"user logged in!"})
    } catch (error) {
        console.log(`Error:${error.message}`)
        return res.status(500).json({message:"Internal server error"})
    }
}


export const logout = async (req,res) => {
    try {
        // clear cookie
        res.clearCookie("linkedin-token")
        return res.status(201).json({message:"user logged out!"})
    } catch (error) {
        console.log(`Error:${error.message}`)
        return res.status(500).json({message:"Internal server error"})
    }
}


export const getCurrentUser=(req,res)=>{
    try {
        res.json(req.user)
    } catch (error) {
        console.log(`Error in getCurrentUser:${error.message}`)
        res.status(500).json({message:"Internal server Error"})
    }
}