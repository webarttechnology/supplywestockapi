const configData = require("./../../config/config.json");
const stripe = require('stripe')(configData.STRIPE_ACCOUNT);
const mongoose = require("mongoose");
const TransactionModel = require("./transaction.service");

const createTransaction = async (req, res) =>{
    const body = req.body;  
    
    try{        
        const transfer = await stripe.transfers.create({
            amount: body.amount*100,
            currency: 'usd',
            destination: 'acct_1MKGkAIqXcPQfOBI',
          });
          
          if(transfer.id != ''){
            const transaction = new TransactionModel({
                transactionId : transfer.balance_transaction,
                sellerId: mongoose.Types.ObjectId(body.sellerId),
                amount: body.amount,
                isPaid: 'paid'
            });
            const result = await transaction.save();
            return res.status(200).json({
                success: 1,
                msg: "Amount transfer successfully."
            }) 
        }else{
            return res.status(400).json({
                success: 0,
                msg: transfer
            }) 
        }       
       
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const getTransaction = async (req, res) => {

}

module.exports = {
    createTransaction: createTransaction,
    getTransaction: getTransaction
}
