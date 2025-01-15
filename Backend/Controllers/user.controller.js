import User from "../Models/user.model.js";
import cloudinary from "../Lib/cloudinary.js";

export const getSuggestions=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id)
        if(!user){
            return res.status(400).json({message:"Unauthorised access!"})
        }
        const suggestions=await User.find({
            _id:{
                $ne:user._id,
                $nin:user.connections
            }
        }).select("name username  profilePicture headline").limit(4)
        return res.json(suggestions)
    } catch (error) {
        console.log(`Error in getSuggestions:${error.message}`)
        return res.status(500).json({message:"Internal server error"})
    }
}

export const getProfile=async(req,res)=>{
    try {
        const user=await User.findOne({username:req.params.username}).select("-password")
        if(!user){
           return res.status(400).json({message:"user not found!"})
        }
        return res.json(user)
    } catch (error) {
        console.log(`Error in getProfile:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const updateProfile=async(req,res)=>{
    try {
        const fields=[
            "name",
            "username",
            "email",
            "password",
            "headline",
            "location",
            "about",
            "skills",
            "experience",
            "education",
            "connections"
        ]
        const updatedFields={}
        for( const field of fields){
            if(req.body[field]){
                updatedFields[field]=req.body[field]
            }
        }
        if(req.body.profilePicture){
            const result=await cloudinary.uploader.upload(req.body.profilePicture)
            updatedFields.profilePicture=result.secure_url
        }
        if(req.body.bannerImg){
            const result=await cloudinary.uploader.upload(req.body.bannerImg)
            updatedFields.bannerImg=result.secure_url
        }
        const user=await User.findByIdAndUpdate(req.user._id,{$set:updatedFields},{new:true}).select("-password")
        return res.json(user)
    } catch (error) {
        console.log(`Error in updateProfile:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const getUserConnections=async(req,res)=>{
    try {
        const user=await User.findOne({username:req.params.username}).populate("connections","name username  profilePicture headline")
        if(!user){
            return res.status(404).json({message:"user not found!"})
        }
        return res.status(200).json(user.connections)
    } catch (error) {
        console.log(`Error in getUserConnections:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}