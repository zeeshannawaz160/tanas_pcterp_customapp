const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");

const supplierSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A Supplier must have a name'],
        trim: true,
    },
    address: String,
    phone: Number,
    email: {
        type: String,
        validate: [validator.isEmail, 'Please provide a valid email']
    },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

supplierSchema.plugin(autoIncrement.plugin, {
    model: "Supplier",
    field: "supplierId"
});


const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;