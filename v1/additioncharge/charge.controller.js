const mongoose = require('mongoose');
const chargeModel = require("./charge.service");
const chargeGet = async (req, res) => {
    try{
        const charges = await chargeModel.findOne({})
        return res.status(200).json({
            success: 1,
            data: charges
        })
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const chargeUpdate = async (req, res) => {
    
    const body = req.body;
    try{
        const charge = await chargeModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(body.id)}, {amount: body.amount})

        return res.status(200).json({
            success: 1,
            msg: "Update successfully"
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

const chargeAdd = async (req, res) => {
    
    const body = req.body;
    try{
        const charge = new chargeModel({
            amount: body.amount
        })
        const amount = await charge.save()

        return res.status(200).json({
            success: 1,
            data: amount
        })

    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        })
    }
}

module.exports = {
    chargeGet: chargeGet,
    chargeUpdate: chargeUpdate,
    chargeAdd: chargeAdd
}