import Notification from "../Models/notification.model.js";

export const getNotifications=async(req,res)=>{
    try {
        const notifications=await Notification.find({
            receipient:req.user._id
        }).populate("relatedUser","name username profilePicture")
          .populate("relatedPost","content image")
          .sort({createdAt:-1})

        return res.status(200).json(notifications)
    } catch (error) {
        console.log(`Error in getNotifications:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const readNotification=async(req,res)=>{
    try {
        const notification=await Notification.findById(req.params.id)
        if(!notification){
            return res.status(404).json({message:"notification not found!"})
        }
        notification.read=true
        await notification.save()
        return res.status(200).json({message:"notification read!"})
    } catch (error) {
        console.log(`Error in readNotification:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const deleteNotification=async(req,res)=>{
    try {
        await Notification.findByIdAndDelete(req.params.id)
        return res.status(200).json({message:"notification deleted!"})
    } catch (error) {
        console.log(`Error in deleteNotification:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}