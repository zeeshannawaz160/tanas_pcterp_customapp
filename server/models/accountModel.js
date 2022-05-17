const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
const accountSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A Account must have a name'],
        trim: true,
    },
    name: String,
    accountNumber: String,
    accountType: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AccountType"
            },
            name: String
        }],
    // accountType: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "AccountType"
    // },
    description: String,
    openingDebit: {
        type: Number,
        default: 0
    },
    openingCredit: {
        type: Number,
        default: 0
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

accountSchema.plugin(autoIncrement.plugin, {
    model: "Account",
    field: "documentId",
});

accountSchema.pre('save', async function (next) {
    this.name = this.accountNumber + " " + this.title;
    this.openingBalance = this.openingDebit - this.openingCredit;
    this.balance = this.openingDebit - this.openingCredit;
    next();
});

accountSchema.pre(['updateOne', 'findOneAndUpdate', 'findByIdAndUpdate'], async function (next) {
    console.log(this._update)
    this._update.name = this._update.accountNumber + " " + this._update.title;
    this._update.openingBalance = this._update.openingDebit - this._update.openingCredit;
    this._update.balance = this._update.openingDebit - this._update.openingCredit;
    next();
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;