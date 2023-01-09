const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    transactionId: {type: String, required: [true, "Transaction code is a required field"]},
    sellerId: {type: mongoose.Types.ObjectId, required: [true, "Seller id is a required field"]},
    amount: {type: Number, required: [true, "Amount is a required field."]},
    isPaid: {type: String, Enum:["unpaid", "paid"], default: "unpaid"}
}, {timestamps: true})

module.exports = mongoose.model("Transactions", transactionSchema);