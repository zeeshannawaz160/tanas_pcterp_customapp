const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const listSchema = mongoose.Schema({
    inactive: Boolean,
    name: {
        type: String,
        required: [true, 'A List must have a name.'],
        trim: true,
    },
    schemaId: {
        type: String,
        required: [true, 'A list must have schema id.'],
        unique: true,
        trim: true

    },
    description: {
        type: String,
    },
    values: [
        {
            key: String,
            value: String,
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

listSchema.plugin(autoIncrement.plugin, {
    model: "List",
    field: "listId"
});


const List = mongoose.model('List', listSchema);
module.exports = List;