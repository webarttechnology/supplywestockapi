const mongoose = require("mongoose");

const chatroomSchema = new mongoose.Schema({
    enquiryId: {type: mongoose.Types.ObjectId},
    chatroomCode: {type: String, required: [true, "Chat room code is a require filed"]},
    userCode: {type: Array}
}, {timestamps: true})

chatroomSchema.index({enquiryId: 1}, {unique: false});
chatroomSchema.index({chatroomCode: 1}, {senderId: true});

module.exports = mongoose.model("Chatrooms", chatroomSchema);
