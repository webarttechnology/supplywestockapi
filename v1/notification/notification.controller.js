const notificationModel = require("./notification.service");
const chatroomModel = require("../chatroom/chatroom.service");
const sellerModel = require("../buyer/buyer.service");
const chatModel = require("../chat/chat.service");
const mongoose = require("mongoose");
const createNotification = async (req, res) => {

    const body = req.body
    try{

        const notification = new notificationModel({
            userId: mongoose.Types.ObjectId('userId'),
            enquiryId: mongoose.Types.ObjectId('enquiryIdenquiry'),
            message: body.message
        })

        const notificationObj = await notification.save();
        return res.status(200).json({
            success: 1,
            data: notificationObj
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getNotificationByuserId = async (req, res) => {
    
    try{
        const notification = await notificationModel.aggregate([
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
                    from: "manufactures",
                    localField: "enquiry.manufacturerId",
                    foreignField: "_id",
                    as: "manufacturer"
                }
                
            },
            {
                $unwind: "$enquiry"
            },
             {
                $unwind: "$manufacturer"
            },

            {
                $match: {"userId": mongoose.Types.ObjectId(req.params.userId), "enquiry.activeAdmin":"1"}
            },
            {
                $project: {"enquiry.enquiryCode": 1, "enquiryId": 1, "manufacturer.name": 1, "message": 1, "isActive": 1, "enquiry.product_des": 1, "enquiry.size": 1, "enquiry.quantities": 1}
            }
        ])

        return res.status(200).json({
            success: 1,
            data: notification
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const acceptBySeller = async (req, res) => {
    try{



        const adminDetails = await sellerModel.findOne({
            roleId: "1"
        })

        const notificationDes = await notificationModel.aggregate([
            {
                $lookup : {
                    from: "enquiries",
                    localField: 'enquiryId',
                    foreignField: "_id",
                    as: "enquiry"
                }               
            },
            {
                $unwind: "$enquiry"
            },
            {
                $match: {"enquiryId": mongoose.Types.ObjectId(req.params.enquiryId), 'userId': mongoose.Types.ObjectId(req.params.userId), 'isActive': "0"}
            },
            {
                $lookup: {
                    from: "sellers",
                    localField: 'userId',
                    foreignField: "_id",
                    as: "seller"
                }
            },
            {
                $unwind: "$seller"
            }
         ])


         if(notificationDes.length > 0){
            // Create a chatroom 
            const chatroom = new chatroomModel({
                chatroomCode: Math.random().toString().substr(2, 6),
                enquiryId: mongoose.Types.ObjectId(req.params.enquiryId),
                userCode: [mongoose.Types.ObjectId(req.params.userId), notificationDes[0].enquiry.buyerId, adminDetails._id]
            })

            const chatroomObj = await chatroom.save()

            const chat = new chatModel({
                "chatroomId": chatroomObj._id,
                "senderId": notificationDes[0].enquiry.buyerId,
                "message": {"msg": notificationDes[0].enquiry.product_des+", Quantities "+notificationDes[0].enquiry.quantities+", Size "+notificationDes[0].enquiry.size}
            })

            const chatobj = await chat.save();


            const updateNotification = await notificationModel.findOneAndUpdate({_id: notificationDes[0]._id}, {'isActive': "1"})

            return res.status(200).json({
                success: 200,
                msg: "Request accepted successfully!"
            })

         }else{
            return res.status(400).json({
                success: 0,
                msg: "Request already accepted!"
            })
         }         
        
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


module.exports = {
    createNotification: createNotification,
    getNotificationByuserId: getNotificationByuserId,
    acceptBySeller: acceptBySeller
}
