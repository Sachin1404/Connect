import ConnectionRequest from "../Models/connectionRequest.model.js";
import User from "../Models/user.model.js";
import Notification from "../Models/notification.model.js";
 

export const getConnectionRequests=async(req,res)=>{
    try {
        const connectionRequests=await ConnectionRequest.find({
            receipient:req.user._id,
            status:"pending"
        }).populate("sender","name username profilePicture headline")
          .sort({createdAt:-1})
    
          return res.status(200).json(connectionRequests)
    } catch (error) {
        console.log(`Error in getConnectionRequests:${error.message}`)
        return res.status(500).json({message:"Internal server error!"})
    }
}

export const getConnections=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).populate("connections","name username profilePicture headline")
        return res.status(200).json(user.connections)
    } catch (error) {
        console.log(`Error in getConnections:${error.message}`)
        res.status(500).json({message:"Internal server error!"})
    }
}

export const sendConnectionRequest=async(req,res)=>{
    try {
        const receipient=await User.findOne({username:req.params.username})
        if (!receipient) {
            return res.status(404).json({ message: "Recipient user not found!" });
        }        
        const sender=await User.findById(req.user._id)
        if(receipient._id.toString()===sender._id.toString()){
            return res.status(400).json({message:"cannot send request to yourself!"})
        }
        if(sender.connections.includes(receipient._id)){
            return res.status(400).json({message:"already a connection!"})
        }
        await ConnectionRequest.findOneAndDelete({
            receipient:receipient._id,
            sender:sender._id
        })
        const connectionRequest=new ConnectionRequest({
            receipient:receipient._id,
            sender:sender._id
        })
        await connectionRequest.save()
        return res.status(201).json(connectionRequest)
    } catch (error) {
        console.log(`Error in sendConnectionRequest:${error.message}`)
        res.status(500).json({message:"Internal server error!"})
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const connectionRequest = await ConnectionRequest.findById(req.params.id);
        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found!" });
        }
        // console.log(connectionRequest.status)
        if (connectionRequest.status.toString() !== "pending") {
            return res.status(400).json({ message: "Connection request already processed!" });
        }
        if(connectionRequest.receipient.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"not authorised to accept!"})
        }
        connectionRequest.status = "accepted";
        await connectionRequest.save();
        const connectionRequest2=await ConnectionRequest.findOne({
            receipient:connectionRequest.sender,
            sender:connectionRequest.receipient
        })
        if(connectionRequest2){
            connectionRequest2.status="accepted"
            await connectionRequest2.save()
        }
        const receipient = await User.findById(connectionRequest.receipient);
        const sender = await User.findById(connectionRequest.sender);
        if (!receipient || !sender) {
            return res.status(404).json({ message: "User not found!" });
        }
        if (!receipient.connections.includes(sender._id)) {
            receipient.connections.push(sender._id);
        }
        if (!sender.connections.includes(receipient._id)) {
            sender.connections.push(receipient._id);
        }
        await receipient.save();
        await sender.save();
        const notification = new Notification({
			receipient: sender._id,
			type: "connectionAccepted",
			relatedUser: receipient._id,
		});
		await notification.save();
        return res.status(200).json({ message: "Connection request accepted successfully!" });
    } catch (error) {
        console.error(`Error in acceptConnectionRequest: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
}

export const rejectConnectionRequest=async(req,res)=>{
    try {
        const connectionRequest=await ConnectionRequest.findById(req.params.id)
        if(!connectionRequest){
            return res.status(404).json({message:"request not found!"})
        }
        if(connectionRequest.receipient.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"not authorised to reject!"})
        }
        if (connectionRequest.status !== "pending") {
            return res.status(400).json({ message: "Connection request already processed!" });
        }
        connectionRequest.status="rejected"
        await connectionRequest.save()
        res.status(200).json({message:"request rejected successfully!"})
    } catch (error) {
        console.error(`Error in rejectConnectionRequest: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
}

export const removeConnection=async(req,res)=>{
    try {
        const connection=await User.findOne({username:req.params.username})
        if(!connection){
            return res.status(404).json({message:"user not found!"})
        }
        req.user.connections=req.user.connections.filter((id)=>id.toString()!==connection._id.toString())
        connection.connections=connection.connections.filter((id)=>id.toString()!==req.user._id.toString())
        await req.user.save()
        await connection.save()
        return res.status(200).json({message:"removed connection successfully!"})
    } catch (error) {
        console.error(`Error in removeConnection: ${error.message}`);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

export const getConnectionStatus = async (req, res) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user._id;

		const currentUser = req.user;
		if (currentUser.connections.includes(targetUserId)) {
			return res.json({ status: "connected" });
		}

		const pendingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: currentUserId, receipient: targetUserId },
				{ sender: targetUserId, receipient: currentUserId },
			],
			status: "pending",
		});

		if (pendingRequest) {
			if (pendingRequest.sender.toString() === currentUserId.toString()) {
				return res.json({ status: "pending" });
			} else {
				return res.json({ status: "received", requestId: pendingRequest._id });
			}
		}

		// if no connection or pending req found
		return res.json({ status: "not_connected" });
	} catch (error) {
		console.error("Error in getConnectionStatus controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};