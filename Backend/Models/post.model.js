import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    comments:[{
        commentContent:{type:String},
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        createdAt:{type:Date,default:Date.now()}
    }]
},{timestamps:true})

const Post=new mongoose.model("Post",postSchema)

export default Post;