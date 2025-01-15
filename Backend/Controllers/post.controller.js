import Post from "../Models/post.model.js";
import cloudinary from "../Lib/cloudinary.js";
import Notification from "../Models/notification.model.js";

export const getFeed=async(req,res)=>{
    try {
        const posts=await Post.find({
            author:{
                $in:[req.user._id,...req.user.connections]
            }
        }).populate("author","name username profilePicture headline")
          .populate("comments.user","name username profilePicture headline")
          .sort({createdAt:-1})

          return res.status(200).json(posts)  
    } catch (error) {
        console.log(`Error in getFeed:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const getMyFeed=async(req,res)=>{
    try {
        const posts=await Post.find({
            author:{
                $in:req.user._id || []
            }
        }).populate("author","name username profilePicture headline")
          .populate("comments.user","name username profilePicture headline")
          .sort({createdAt:-1})

          return res.status(200).json(posts)  
    } catch (error) {
        console.log(`Error in getFeed:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const upload=async(req,res)=>{
    try {
        const {content,image}=req.body
        if(!content){
            return res.status(400).json({message:"content is required!"})
        }
        let post=new Post({
            content,
            author:req.user._id
        })
        if(image){
            const result=await cloudinary.uploader.upload(image)
            post.image=result.secure_url
        }
        await post.save()
        return res.status(201).json(post)
    } catch (error) {
        console.log(`Error in upload:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const getPost=async(req,res)=>{
    try {
        const postId=req.params.id
        const post=await Post.findById(postId).populate("author","name username profilePicture headline")
                                              .populate("comments.user","name username profilePicture headline")
        if(!post){
            return res.status(400).json({message:"post not found!"})
        }
        return res.status(200).json(post)
    } catch (error) {
        console.log(`Error in getPost:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const deletePost=async(req,res)=>{
    try {
        const postId=req.params.id
        const post=await Post.findById(postId)
        if(req.user._id.toString()!==post.author.toString()){
            return res.status(400).json({message:"not authorised to delete!"})
        }
        if(post.image){
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0])
        }
        await Post.findByIdAndDelete(post._id)
        return res.status(201).json({message:"post deleted!"})
    } catch (error) {
        console.log(`Error in deletePost:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const hitLike=async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({message:"post not found!"})
        }
        if(post.likes.includes(req.user._id)){
            post.likes=post.likes.filter((id)=>id.toString()!==req.user._id.toString())
        }
        else{
            post.likes.push(req.user._id)
        }
        await post.save()

        //Notification save in database
        if(post.author.toString()!==req.user._id.toString()){
            const notification=new Notification({
                receipient:post.author,
                type:"like",
                relatedUser:req.user._id,
                relatedPost:post._id
            })
            await notification.save()
        }

        return res.status(201).json(post)
    } catch (error) {
        console.log(`Error in hitLike:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const comment=async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(400).json({message:"post not found!"})
        }
        const commentContent=req.body.commentContent
        console.log(commentContent)
        if(!commentContent || commentContent.trim()===""){
            return res.status(400).json({message:"comment cannot be empty!"})
        }
        post.comments.push({
            commentContent,
            user:req.user._id
        })
        await post.save()

        //Notification save in database
        if(post.author.toString()!==req.user._id.toString()){
            const notification=new Notification({
                receipient:post.author,
                type:"comment",
                relatedUser:req.user._id,
                relatedPost:post._id
            })
            await notification.save()
        }

        return res.status(201).json(post)
    } catch (error) {
        console.log(`Error in comment:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const deleteComment=async(req,res)=>{
    try {
        const postId=req.params.postId
        const commentId=req.params.commentId
        const post=await Post.findById(postId)
        if(!post){
            return res.status(404).json({message:"post not found!"})
        }
        post.comments=post.comments.filter((comment)=>comment._id.toString()!==commentId.toString())
        await post.save()
        return res.status(200).json({message:"comment deleted successfully!"})
    } catch (error) {
        console.log(`Error in deleteComment:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}