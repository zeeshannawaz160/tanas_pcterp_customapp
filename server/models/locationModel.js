const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const locationSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Please enter Location Name.']
    },
    address: String,
    locationNumber: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

locationSchema.plugin(autoIncrement.plugin, {
    model: "Location",
    field: "locationId"
});


const Location = mongoose.model('Location', locationSchema);
module.exports = Location;