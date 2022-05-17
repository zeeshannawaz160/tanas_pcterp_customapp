const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const subsidiarySchema = mongoose.Schema({
    inactive: Boolean,
    name: {
        type: String,
        required: [true, 'A Subsidiary must have a name'],
        trim: true,
    },
    country: {
        type: String,
    },
    state: {
        type: String,
    },
    address: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

subsidiarySchema.plugin(autoIncrement.plugin, {
    model: "Subsidiary",
    field: "subsidiaryId"
});


const Subsidiary = mongoose.model('Subsidiary', subsidiarySchema);
module.exports = Subsidiary;