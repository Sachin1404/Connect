import mongoose from "mongoose";

const connectionRequestSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    }
},{timestamps:true})

const ConnectionRequest=new mongoose.model("ConnectionRequest",connectionRequestSchema)

export default ConnectionRequest;