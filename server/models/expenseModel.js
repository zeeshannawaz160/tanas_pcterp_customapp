const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const expenseSchema = mongoose.Schema(
  {
    name: String,
    category: String,
    amountPaid: Number,
    amountDue: Number,
    notes: String,
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    status: {
      type: String,
      enum: ["Sumbitted", "Approved", "Paid", "Refused", "Pending"],
      default: "Sumbitted",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

expenseSchema.plugin(autoIncrement.plugin, {
  model: "Expense",
  field: "expenseId",
});

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
