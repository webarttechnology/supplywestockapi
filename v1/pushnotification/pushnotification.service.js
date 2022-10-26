const mongoose = require("mongoose");

const pushnotificationSchema = mongoose.Schema({
    message: {type: String, required: [true, "Message is a require field"]},
    showFor: {type: Array, required: [true, "Show for is a requre field"]},
    redirectTo: {type: String},
    isShow: {type: String, Enum:["0", "1"], default: "0"}
}, {timestamps: true})

module.exports = mongoose.model('pushnotifications', pushnotificationSchema)