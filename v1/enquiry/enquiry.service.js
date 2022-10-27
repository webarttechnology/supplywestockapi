const mongoose = require("mongoose")

const enquirySchema = new mongoose.Schema({
        enquiryId: {type: String, required: [true, "Enquiry Id is a require field"]},
        buyerId: {type: mongoose.Types.ObjectId, required: [true, "Buyer id is a require field"]}, 
        manufacturerId: {type: mongoose.Types.ObjectId, required: [true, "Manufacturer id is a require field"]},
        enquiryCode: {type: String, required: [true, "Enquiry code is a require field"]},
        product_des: {type: String, required: [true, "Product details is a require field"]},
        productName: {type: String, required: [true, "Product name is a require field"]},
        size: { type: String},
        color: {type: String},
        quantities: {type: Number, required: [true, "Product quantities is a require field"]},
        activeAdmin: {type: String, Enum:["0", "1"], default: "0"}
}, {timestamps: true})

enquirySchema.index({buyerId: 1}, {unique: false});
enquirySchema.index({enquiryCode: 1}, {unique: true});
enquirySchema.index({manufacturerId: 1}, {unique: false});

module.exports = mongoose.model("Enquiries", enquirySchema)
