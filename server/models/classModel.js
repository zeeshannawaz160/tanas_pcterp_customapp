const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
const classSchema = mongoose.Schema({
    inactive: Boolean,
    name: {
        type: String,
        required: [true, 'A Class must have a name'],
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'A Class must have a type'],
    },
    subsidiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subsidiary"
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

classSchema.plugin(autoIncrement.plugin, {
    model: "Class",
    field: "classId",
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;