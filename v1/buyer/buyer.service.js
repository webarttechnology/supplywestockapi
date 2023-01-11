const mongoose = require("mongoose");
const buyerSchema = mongoose.Schema({ 
    userCode: {type: String},  
    firstName: {type: String, required: [true, "firstName is a require field"]},
    lastName: {type: String, required: [true, "lastName is a require field"]},
    mobileNo: {type: String},
    emailId: {type: String, required: [true, "Email Id is require field"]},
    password: {type: String, required: [true, "Password is a require field"]},
    address: {type: String},
    city: {type: String},
    pincode: {type: String},
    state: {type: String},
    otp: {type: String},
    strip_acc: {type: String},
    isActive: {type: String, Enum: ["0", "1"], default: "0"},
    isVerified: {type: String, Enum: ["0", "1"], default: "0"},
    manufacturer: {type: Array},
    roleId: {type: String, Enum: ["1", "2", "3"], required: [true, "Role is a require field"]}  // 1 For admin, 2 for Seller, 3 for buyer
}, {timestams: true})

module.exports = mongoose.model("Sellers", buyerSchema);
