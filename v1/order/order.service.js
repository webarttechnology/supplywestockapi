const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    buyerId: {type: mongoose.Types.ObjectId},
    sellerId: {type: mongoose.Types.ObjectId},
    enquiryId: {type: mongoose.Types.ObjectId},
    unitPrice: { type: Number},
    quantities: { type: String},
    productName: {type: String},
    totalAmount: {type: Number},
    finalAmount: { type: Number},
    chatRoomId: {type: mongoose.Types.ObjectId}
}, {timestamps: true})

module.exports = mongoose.model("Orders", orderSchema);
