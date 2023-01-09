const stripe = require('stripe')('sk_test_51MCHiwINOV0G9TVn88bG12kf8LobjCMJo4MJQA45PGv02R1qdmRD7Zm5jx1dgxkieWaHXUWIBmdMpls8nWDtVTPz006igXYQWL');
const chatModel = require('../chat/chat.service');
const orderModel = require("../order/order.service");
const sellerModel = require("../buyer/buyer.service");
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
            after_completion: {type: 'redirect', redirect: {url: "http://supplywestock.com/payment/succuess/{CHECKOUT_SESSION_ID}"}},
          });

	
          const updateOrder = await orderModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(orderObj._id)}, {stripeId: paymentLink.id})

          const chat = new chatModel({
            chatroomId: mongoose.Types.ObjectId(body.chatroomId),
            senderId: mongoose.Types.ObjectId(body.sellerId),
            message: [{msg: "Payment link generate successfully.", link: paymentLink.url, btn: "payment"}]
          })

          const data = await chat.save();

          return res.status(200).json({
            success: 1,
            msg: "Payment link has been share successfully.",
            url: paymentLink.url
          })

    }catch(e){
        return res.status(400).json(e)
    }
}

const updatePayment = async (req, res) => {
  const body = req.body;
  try{ 
    const session = await stripe.checkout.sessions.retrieve(body.session_id); 
    const updateStatus = await orderModel.findOneAndUpdate({stripeId: session.payment_link}, {isPaid: session.payment_status})

    if(session.payment_status == "paid"){
      const chat = new chatModel({
        chatroomId: mongoose.Types.ObjectId(updateStatus.chatRoomId),
        senderId: mongoose.Types.ObjectId(updateStatus.buyerId),
        message: [{msg: "Payment processed"}]
      })
      const data = await chat.save();
    }

    return res.status(200).json({
      success: 1,
      data: session.payment_status
    })


  }catch(e){
    return res.status(400).json(e)
  }

}

const createStripeAccount = async (req, res) => {
  const body = req.body;
  try{
    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'US',
      email: body.emailId,
      capabilities: {
        card_payments: {requested: true},
        transfers: {requested: true},
      },
    });

    const accountaccept = await stripe.accounts.update(
      account.id,
      {tos_acceptance: {date: Math.floor(Date.now()/ 1000), ip: '8.8.8.8'}}
    );  

    const updateSaler = await sellerModel.findOneAndUpdate({'emailId': body.emailId}, {strip_acc: account.id})

    return res.status(200).json({
      success: 1,
      msg: "Account activation successfully"
    })
  }catch(e){
    return res.status(400).json(e)
  }
}

const transferMoney =  async (req, res) => {
   const body = req.body;
   try{
      const transfer = await stripe.transfers.create({
        amount: 1,
        currency: 'usd',
        destination: 'acct_1MKGkAIqXcPQfOBI',
        transfer_group: 'ORDER_95',
      });

      console.log(transfer);
      return false;
   }catch(e){
    return res.status(400).json(e)
   }
}  

module.exports = {
    createPaymentLink: createPaymentLink,
    requestPaymentLink: requestPaymentLink,
    updatePayment:updatePayment,
    createStripeAccount: createStripeAccount,
    transferMoney: transferMoney
}
