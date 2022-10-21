const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    chatroomId: {type: mongoose.Types.ObjectId, required: [true, "Chatroom id is a require field"]},
    senderId: {type: mongoose.Types.ObjectId, required: [true, "Sender id is a require field"]},
    message: {type: Array},
    isSeen: {type: String, Enum: ["0", "1"], default: "0"}
}, {timestamps: true})

chatSchema.index({chatroomId: 1}, {unique: false});
chatSchema.index({senderId: 1}, {unique: false});

module.exports = mongoose.model("Chats", chatSchema)
