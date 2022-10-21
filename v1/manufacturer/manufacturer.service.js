const mongoose = require("mongoose");

const manufacturerSchema = mongoose.Schema({
    name: {type: String, required: [true, "Manufacturer name is a required field"]},
    image: {type: String, required: [true, "Manufacturer image is a required field"]},
    sellers: {type: Array}
}, {timestamps: true})

module.exports = mongoose.model("Manufactures", manufacturerSchema);