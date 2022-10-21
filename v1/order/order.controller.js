const mongoose = require("mongoose");
const orderModel = require("./order.service");
const enquiryModel = require("../enquiry/enquiry.service");
const chatModel = require("../chat/chat.service");
const sellerModel = require("../buyer/buyer.service");
const chargesModel = require("../additioncharge/charge.service");
const createOrder = async (req, res) => {
    const body = req.body;
    try{

        const seller = await sellerModel.findOne({_id: mongoose.Types.ObjectId(body.sellerId)});
        
      
        const checkunique = await orderModel.find({buyerId: mongoose.Types.ObjectId(body.buyerId),
            sellerId: mongoose.Types.ObjectId(body.sellerId),
            enquiryId: mongoose.Types.ObjectId(body.enquiryId)}).count();

        const checkBuyerId = await enquiryModel.find({buyerId: mongoose.Types.ObjectId(body.buyerId)}).count();
        
        if(!checkBuyerId){
            return res.status(400).json({
                success: 0,
                msg: "Buyer id does not match."
            })
        }

        const addcharges = await chargesModel.findOne({})
       

        const totalAmount = body.unitPrice * body.quantities;
        const finalAmount = totalAmount + (totalAmount*addcharges.amount/100);
       
        const order = new orderModel({
            buyerId: mongoose.Types.ObjectId(body.buyerId),
            sellerId: mongoose.Types.ObjectId(body.sellerId),
            enquiryId: mongoose.Types.ObjectId(body.enquiryId),
            productName: body.productName,
            unitPrice: body.unitPrice,
            quantities: body.quantities,
            totalAmount: totalAmount,
            finalAmount: finalAmount,
            chatRoomId: mongoose.Types.ObjectId(body.chatroomId),
        })        

        const records  = await order.save();

        const message = `<div class='isResiver'><p>order has been generated by : ${seller.id}</p><strong class='headingPd'>Product Details</strong><ul class='proDetails'><li><strong>Product name :</strong>${body.productName}</li><li><strong>Amount : </strong>${finalAmount}</li><li><strong>Quantities : </strong> ${body.quantities}</li></ul></div>`


        const chat = new chatModel({
            "chatroomId": body.chatroomId,
            "senderId": mongoose.Types.ObjectId(body.sellerId),
            "message": [{msg: message, btn: "accept"}]
        })

        const saveChat = await chat.save();


        if(records){
            return res.status(200).json({
                success: 1,
                data: records
            })
        }
        

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getOrder = async (req, res) => {
    try{
        const orders = await orderModel.aggregate([{
            $lookup: {
                from: "sellers",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller"
            }
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
            $lookup: {
                from: "enquiries",
                localField: "enquiryId",
                foreignField: "_id",
                as: "enquiry"
            }
        },
        {
            $project: {"enquiry.product_des": 1, "enquiry.size": 1, "enquiry.quantities": 1, "enquiry.enquiryCode": 1, "seller.firstName":1, "seller.lastName": 1, "buyer.firstName": 1, "buyer.lastName": 1, unitPrice: 1, quantities: 1, productName: 1, totalAmount: 1, finalAmount: 1}
        }]);
        return res.status(200).json({
            success:1,
            data: orders
        })
        
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getOrderById = async (req, res) => {
    try{
        const orders = await orderModel.find({_id: mongoose.Types.ObjectId(req.params.id)});
        return res.status(200).json({
            success:1,
            data: orders
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}



const getorderBySellerId = async (req, res) => {
    try{
        const orders = await orderModel.aggregate([{
            $lookup: {
                from: "sellers",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller"
            }
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
            $lookup: {
                from: "enquiries",
                localField: "enquiryId",
                foreignField: "_id",
                as: "enquiry"
            }
        },{
            $match: {sellerId: mongoose.Types.ObjectId(req.params.sellerId)}
        },
        {
            $project: {"enquiry.product_des": 1, "enquiry.size": 1, "enquiry.quantities": 1, "enquiry.enquiryCode": 1, "seller.firstName":1, "seller.lastName": 1, "buyer.firstName": 1, "buyer.lastName": 1, unitPrice: 1, quantities: 1, productName: 1, totalAmount: 1, finalAmount: 1}
        }]);



        return res.status(200).json({
            success:1,
            data: orders
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getorderByBuyerId = async (req, res) => {
    try{
        const orders = await orderModel.aggregate([{
            $lookup: {
                from: "sellers",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller"
            }
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
            $lookup: {
                from: "enquiries",
                localField: "enquiryId",
                foreignField: "_id",
                as: "enquiry"
            }
        },{
            $match: {buyerId: mongoose.Types.ObjectId(req.params.buyerId)}
        },
        {
            $project: {"enquiry.product_des": 1, "enquiry.size": 1, "enquiry.quantities": 1, "enquiry.enquiryCode": 1, "seller.firstName":1, "seller.lastName": 1, "buyer.firstName": 1, "buyer.lastName": 1, unitPrice: 1, quantities: 1, productName: 1, totalAmount: 1, finalAmount: 1}
        }]);



        return res.status(200).json({
            success:1,
            data: orders
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const updateOrder = async (req, res)=>{
    const body = req.body;
    try{        
        const order = await orderModel.findByIdAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {sellerId: mongoose.Types.ObjectId(body.sellerId), unitPrice: body.unitPrice, quantities: body.quantities, totalAmount: body.unitPrice*body.quantities});

        return res.status(200).json({
            success: 1,
            msg: "Data updated successfully."
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const deleteOrder = async (res, req) =>{
    try{
        const order = await orderModel.findByIdAndRemove({_id: res.params.id})
        return res.status(200).json({
            success: 1,
            msg: "Data deleted successfully."
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

module.exports = {
    createOrder: createOrder,
    getOrder: getOrder,
    getOrderById: getOrderById,
    updateOrder: updateOrder,
    deleteOrder: deleteOrder,
    getorderBySellerId: getorderBySellerId,
    getorderByBuyerId:getorderByBuyerId 
}