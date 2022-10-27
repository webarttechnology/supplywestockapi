const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderId: {type: String, required: [true, "Order Id is a require field"]},
    buyerId: {type: mongoose.Types.ObjectId, required: [true, "Buyer Id is a require field"]},
    sellerId: {type: mongoose.Types.ObjectId, required: [true, "Seller Id is a require field"]},
    enquiryId: {type: mongoose.Types.ObjectId, required: [true, "Enquiry Id is a require field"]},
    unitPrice: { type: Number},
    quantities: { type: String},
    productName: {type: String},
    totalAmount: {type: Number},
    finalAmount: { type: Number},
    chatRoomId: {type: mongoose.Types.ObjectId},
    stripeId: {type: String},
    isPaid: {type: String, Enum:["unpaid", "paid"], default: "unpaid"}
}, {timestamps: true})

module.exports = mongoose.model("Orders", orderSchema);
