const stripe = require('stripe')('sk_test_51KqwahSGaCSVUxPYRxkYFeHieZHiXtnmyhezBLiOZJSFC19FCvPeQDq3kDEzqjRgReDrgMARZns8YDuwUCeLeK1D00tMoJCkqG');
const chatModel = require('../chat/chat.service');
const orderModel = require("../order/order.service");
const mongoose = require("mongoose");

const requestPaymentLink = async (req, res) => {
    const body = req.body;
    try{

      const chat = new chatModel({
        chatroomId: mongoose.Types.ObjectId(body.chatroomId),
        senderId: mongoose.Types.ObjectId(body.buyerId),
        message: [{msg: "Order accepted by buyer. Generate a payment link.", btn: "paymentLink"}]
      })

      const data = await chat.save();

      return res.status(200).json({
        success: 1,
        msg: "Payment link has been sent."
      })

    }catch(e){
      return res.status(400).json({
        success: 0,
        msg: e
      })
    }
}

const createPaymentLink = async (req, res) => {

    const body = req.body;
    console.log(body);
     const orderObj = await orderModel.findOne({chatRoomId: mongoose.Types.ObjectId(body.chatroomId)})
	
  
    try{

        const product = await stripe.products.create({
            name: orderObj.productName,
          });
    
          const price = await stripe.prices.create({
            unit_amount: orderObj.finalAmount*100,
            currency: 'inr',
            product: product.id,
          });
        
    
          const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
            after_completion: {type: 'redirect', redirect: {url: 'http://supplywestock.com'}},
          });

          const chat = new chatModel({
            chatroomId: mongoose.Types.ObjectId(body.chatroomId),
            senderId: mongoose.Types.ObjectId(body.sellerId),
            message: [{msg: "Payment link generate successfully.", link: paymentLink.url, btn: "payment"}]
          })

          const data = await chat.save();

          return res.status(200).json({
            success: 1,
            msg: "Payment link has been share successfully."
          })

    }catch(e){
        return res.status(400).json(e)
    }
}

module.exports = {
    createPaymentLink: createPaymentLink,
    requestPaymentLink: requestPaymentLink
}
