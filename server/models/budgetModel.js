const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");
const Employee = require("./employeeModel");

// FIELDS ARE >>>
const budgetSchema = mongoose.Schema({
    subsidiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subsidiary",
    },
    year: {
        type: String,
        required: [true, "A Budget must have a year"],
        trim: true,
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
    },
    accountType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccountType",
    },
    totalAmount: Number,
    budgets: [{
        apply: Boolean,
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
        },
        mayAmount: Number,
        juneAmount: Number,
        julyAmount: Number,
        augustAmount: Number,
        septemberAmount: Number,
        octoberAmount: Number,
        novemberAmount: Number,
        decemberAmount: Number,
        januaryAmount: Number,
        februaryAmount: Number,
        marchAmount: Number,
        aprilAmount: Number,
        linetotal: Number
    }]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);

budgetSchema.plugin(autoIncrement.plugin, {
    model: "Budget",
    field: "budgetId",
});



const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
