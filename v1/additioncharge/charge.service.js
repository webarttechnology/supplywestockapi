const mongoose = require('mongoose');

const chargeSchema = mongoose.Schema({
    amount: {type:Number, required: [true, "Amount is a require field"]}
}, {timestams: true})

module.exports = mongoose.model("Charges", chargeSchema);