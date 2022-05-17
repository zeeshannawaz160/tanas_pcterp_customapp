const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
const journalEntrySchema = mongoose.Schema({
    entryNumber: {
        type: String,
        required: [true, 'A Journal Entry must have a Entry Number.'],
        trim: true,
    },
    approved: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    memo: String,
    postingPeriod: String,
    subsidiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subsidiary"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    journalDetails: [
        {
            account: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Account"
            },
            entityName: String,
            debit: Number,
            credit: Number,
            notes: String,
        }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

journalEntrySchema.plugin(autoIncrement.plugin, {
    model: "JornalEntry",
    field: "journalEntryId",
});

const JornalEntry = mongoose.model('JornalEntry', journalEntrySchema);
module.exports = JornalEntry;