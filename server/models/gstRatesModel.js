const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
const gstRatesSchema = mongoose.Schema({
    name: String,
    type: {
        type: String,
        required: true,
        enum: ['Goods', 'Services'],
        default: 'Goods'
    },
    description: String,
    cgstRate: Number,
    sgstRate: Number,
    igstRate: Number,
    cess: Number
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

gstRatesSchema.plugin(autoIncrement.plugin, {
    model: "GSTRates",
    field: "gstRatesId",
});

// gstRatesSchema.pre('save', async function (next) {
//     this.balance = parseFloat(this.debit) - parseFloat(this.credit);
//     next();
// });

const GSTRates = mongoose.model('GSTRates', gstRatesSchema);
module.exports = GSTRates;