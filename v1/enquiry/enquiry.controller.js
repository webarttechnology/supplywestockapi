const enquiryModel = require("./enquiry.service");
const mongoose = require("mongoose");
const manufacturerModel = require("../manufacturer/manufacturer.service");
const notificationModel = require("../notification/notification.service");
const chatroomModel = require("../chatroom/chatroom.service");
const chatModel = require("../chat/chat.service");
var nodemailer = require('nodemailer');
const axios = require('axios');
const config = require("../../config/config.json");


const createEnquiry = async (req, res) => {
    const body = req. body
    const baseUrl = config.HTTP+req.headers.host;


   try{
        const enquiryObj = new enquiryModel({
            buyerId: mongoose.Types.ObjectId(body.buyerId),
            manufacturerId: mongoose.Types.ObjectId(body.manufacturerId),
            product_des: body.product_des,
            productName: body.productName,
            size: body.size,
	    color: body.color,	
            enquiryCode: Math.random().toString().substr(2, 6),
            quantities: body.quantities
        })

        var enquiry = await enquiryObj.save();
        const result = await  axios.get(`${baseUrl}/v1/enquiries/accept/630f472eb83387e6dc0230d0/${enquiry.id}`)



        const getSellerId = await manufacturerModel.aggregate([
            {
                $lookup: {
                    from: "sellers",
                    localField: "sellers", 
                    foreignField: "_id", 
                    as: "seller"
                }
            },
            {
                $unwind: "$seller"
            },
            {$match: {"_id": mongoose.Types.ObjectId(body.manufacturerId)}}

        ], function(err, obj){            
            obj.map((data, index) => {              
               
                const notification = new notificationModel({
                    userId: mongoose.Types.ObjectId(data.seller._id),
                    enquiryId: mongoose.Types.ObjectId(enquiry._id),
                    message: "One new enquiry",
                    isActive: "0"
                })

                notification.save();

            })            
        })

        return enquiry?res.status(200).json({success: 1, msg: "Your enquiry has been sent successully. We will contact very soon."}):res.status(400).json({success: 0, msg: "Enquiry error. Please try again"})

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getEnquiry = async (req, res) => {
    try{
        const enquiry = await enquiryModel.aggregate([
            {
                $sort: {createdAt: -1}
            },
            {
            $lookup: {
                from: "sellers",
                localField: "buyerId", 
                foreignField: "_id", 
                as: "buyer"
            }
            },
            {
                $unwind: "$buyer"
            },
            {
                $lookup: {
                    from: "manufactures",
                    localField: "manufacturerId", 
                    foreignField: "_id", 
                    as: "manufacturer"
                }
            },
            {
                $unwind: "$manufacturer"
            },
            {
                $project: {"buyer._id": 1, "buyer.firstName": 1, "buyer.lastName": 1, "buyer.emailId": 1, "manufacturer.name": 1, "manufacturer.name": 1, "manufacturer.image": 1, "product_des": 1, "productName": 1,  "size": 1, "quantities": 1, "activeAdmin":1, "enquiryCode": 1}
            }
        ])

        return res.status(200).json({
            success: 1,
            data: enquiry
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


const getEnquiryByBuyerId = async (req, res) => {   
    
    try{
        const enquiry = await enquiryModel.aggregate([
            {
                $sort: {createdAt: -1}
            },
            {
            $lookup: {
                from: "sellers",
                localField: "buyerId", 
                foreignField: "_id", 
                as: "buyer"
            }
            },
            {
                $unwind: "$buyer"
            },
            {
                $match: {"buyerId": mongoose.Types.ObjectId(req.params.buyerId)}
            },
            {
                $lookup: {
                    from: "manufactures",
                    localField: "manufacturerId", 
                    foreignField: "_id", 
                    as: "manufacturer"
                }
            },
            {
                $unwind: "$manufacturer"
            },
            {
                $project: {"buyer.firstName": 1, "buyer.lastName": 1, "buyer.emailId": 1, "manufacturer.name": 1, "manufacturer.name": 1, "manufacturer.image": 1, "product_des": 1, "size": 1, "quantities": 1, "enquiryCode": 1, "productName": 1}
            }
            
        ])

        return res.status(200).json({
            success: 1,
            data: enquiry
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getEnquiryByManufacturerId = async (req, res) => {
   
    try{
        const enquiry = await enquiryModel.aggregate([{
            $lookup: {
                from: "sellers",
                localField: "buyerId", 
                foreignField: "_id", 
                as: "buyer"
            }
            },
            {
                $unwind: "$buyer"
            },            
            {
                $lookup: {
                    from: "manufactures",
                    localField: "manufacturerId", 
                    foreignField: "_id", 
                    as: "manufacturer"
                }
            },
            {
                $match: {"manufacturerId": mongoose.Types.ObjectId(req.params.manufacturerId)}
            },
            {
                $unwind: "$manufacturer"
            },
            {
                $project: {"buyer.firstName": 1, "buyer.lastName": 1, "buyer.emailId": 1, "manufacturer.name": 1, "manufacturer.name": 1, "manufacturer.image": 1, "product_des": 1, "size": 1, "activeAdmin":1, "quantities": 1, "enquiryCode": 1}
            }
            
        ])

        return res.status(200).json({
            success: 1,
            data: enquiry
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}


const acceptEnquiryByadmin = async (req, res) => {
    try{
        const checkActiveOrNot = await enquiryModel.find({_id: mongoose.Types.ObjectId(req.params.enquiryId), 'activeAdmin': "0"}).count(); 
        if(checkActiveOrNot == 1){
            const enquiry = await enquiryModel.findByIdAndUpdate({
                _id: mongoose.Types.ObjectId(req.params.enquiryId)
            },{
                activeAdmin: "1"
            })

            return res.status(200).json({
                success: 1,
                msg: "Enquiry accpted successfull"
            })
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Already Accepted!"
            })
        }      


    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
} 

const getSellersByEnquery = async (req, res) => {
    
    try{
        const sellerDetails = await notificationModel.aggregate([{
            $lookup: {
                from: "sellers",
                localField: "userId", 
                foreignField: "_id", 
                as: "seller"
            }
        },
	{
	 $unwind: '$seller'
	},
        {
            $match: {enquiryId: mongoose.Types.ObjectId(req.params.enquiryId), isActive: "1"}
        },
        {
            $project: {_id: 1, enquiryId: 1, 'seller.firstName': 1, 'seller.lastName': 1, 'seller._id': 1,}
        }
        ])

        return res.status(200).json({
            success: 1,
            data: sellerDetails
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

module.exports = {
    createEnquiry: createEnquiry,
    getEnquiry: getEnquiry,
    getEnquiryByBuyerId: getEnquiryByBuyerId,
    getEnquiryByManufacturerId: getEnquiryByManufacturerId,
    acceptEnquiryByadmin: acceptEnquiryByadmin,
    getSellersByEnquery: getSellersByEnquery
}
