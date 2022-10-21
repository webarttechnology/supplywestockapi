const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
        userId: {type: mongoose.Types.ObjectId, required: [true, "User id is a require field"]},
        enquiryId: {type: mongoose.Types.ObjectId, required: [true, "Enquire id is a require field"]},
        message: {type: String, required: [true, "Message is a require field"]},
        isActive: {type: String, Enum: ["0", "1"], default:"0"}
}, {timestamps: true})

module.exports = mongoose.model('Notifications', notificationSchema);
