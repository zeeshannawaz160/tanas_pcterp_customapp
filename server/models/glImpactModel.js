const mongoose = require('mongoose');
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const glImpactSchema = mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },
    debit: Number,
    credit: Number,
    posting: Boolean,
    memo: String,
    entityName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    subsidiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subsidiary"
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location"
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    transactionType: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'onModel'
    },
    transactionNumber: Number,
    onModel: {
        type: String,
        required: true,
        enum: ['InventoryAdjustment', 'JornalEntry']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

glImpactSchema.plugin(autoIncrement.plugin, {
    model: "GLImpact",
    field: "glImpactId"
});


const GLImpact = mongoose.model('GLImpact', glImpactSchema);
module.exports = GLImpact;