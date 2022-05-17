const mongoose = require('mongoose');
const validator = require('validator');


// FIELDS ARE >>>
const nameSchema = mongoose.Schema({

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});


const Name = mongoose.model('Name', nameSchema);
module.exports = Name;