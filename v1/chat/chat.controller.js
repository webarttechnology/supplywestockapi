const chatModel = require("./chat.service");
const chatroomModel = require("../chatroom/chatroom.service");
const mongoose = require("mongoose");
const createChat = async (req, res) => {
    const body = req.body   
    try{

        const checksenderId = await chatroomModel.find({userCode: mongoose.Types.ObjectId(body.senderId)}).count();

        if(checksenderId){
        const msg = new chatModel({
            senderId: mongoose.Types.ObjectId(body.senderId),
            chatroomId: mongoose.Types.ObjectId(body.chatroomId),
            message: [body.message]
        }) 
        
        const insObj = await msg.save();

        return res.status(200).json({
            success: 1,
            data: insObj
        }) 
    }else{
        return res.status(400).json({
            success: 0,
            data: "Sender id does not exists"
        }) 
    }  
        
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getChat = async (req, res) => {    
    try{
        //const chat = await chatModel.find({chatroomId: mongoose.Types.ObjectId(req.params.chatroomId)})
     
        const chat = await chatModel.aggregate([{
            $lookup: {
                from: "sellers",
                foreignField: "_id",
                localField: "senderId",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $match: {chatroomId: mongoose.Types.ObjectId(req.params.chatroomId)}
        },
        {
            $project: {"user.firstName": 1, "user.lastName": 1, "chatroomId": 1, "user.userCode": 1, senderId: 1, message: 1, createdAt: 1}
        }]);


        return res.status(200).json({
            sucess: 1,
            data: chat
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


const readChat = async (req, res) => {
    const body = req.body;
    try{

	console.log(body);
	

        const chat = await chatModel.updateMany({chatroomId: mongoose.Types.ObjectId(body.chatroomId), senderId: {"$ne": mongoose.Types.ObjectId(body.senderId)}}, {isSeen: "1"}, { multi: true });
        return res.status(200).json({
            success: 1,
            msg: "Update success"
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}





module.exports = {
    createChat: createChat,
    getChat: getChat,
    readChat: readChat
}
