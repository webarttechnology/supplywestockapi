const mongoose = require("mongoose");
const TransactionModel = require("./transaction.service");

const createTransaction = async (req, res) =>{
    const body = req.body;  
    try{        
        // const transfer = await stripe.transfers.create({
        //     amount: 1,
        //     currency: 'usd',
        //     destination: 'acct_1MKGkAIqXcPQfOBI',
        //     transfer_group: 'ORDER_95',
        //   });

        //console.log(Date.now());
        const transaction = new TransactionModel({
            transactionId : "12345689556665",
            sellerId: mongoose.Types.ObjectId(body.sellerId),
            amount: body.amount,
            isPaid: 'paid'
        });

        const result = await transaction.save();
        
        //console.log(Date.now());
        if(result){
            return res.status(200).json({
                success: 1,
                msg: "Amount transfer successfully."
            }) 
        }else{
            return res.status(400).json({
                success: 0,
                msg: "Error. please try again"
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
