const chatroomModel = require("./chatroom.service");
const chatModel = require("../chat/chat.service");
const mongoose = require("mongoose");

const getchatRoom = async (req, res) => {
    try{

        const chatroom = await chatroomModel.aggregate([
            {
                '$sort': {
                  "sellers.firstName": -1
                }
            },
            {
                $lookup: {
                    from: "enquiries",
                    localField: "enquiryId",
                    foreignField: "_id",
                    as: "enquiry"
                }
            },
            {
                $lookup: {
                    from: "sellers",
                    localField: "userCode",
                    foreignField: "_id",
                    as: "users"                    
                }              
            }, 
            {
                $lookup: {
                    from: "chats",
                    localField: "_id",
                    foreignField: "chatroomId",
                    as: "chat"                    
                }              
            },           
            {
                $match: { userCode: mongoose.Types.ObjectId(req.params.userCode)}
            },
            {
                $project: {chatroomCode:1, enquiryId: 1, "enquiry.productName": 1, "enquiry.product_des": 1, "users.firstName": 1, "users.lastName": 1, "users.userCode": 1, "users._id": 1, "users.emailId": 1, "users.roleId": 1}
            },
            {
                $sort: {
                  'chat.createdAt': -1,
                }
            }
        ],  async function(err, records){  
            var result = []

             for(let i=0; i<records.length; i++){
                const unseenCode = await chatModel.find({chatroomId: records[i]._id, senderId: {"$ne": req.params.userCode}, isSeen: "0"}).count();
                records[i].unseenCount = unseenCode;
                result.push(records[i]);
             }

        
             return res.status(200).json({
                success: 1,
                data: result
            })
            
        });

      
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

module.exports = {
    getchatRoom: getchatRoom
}
