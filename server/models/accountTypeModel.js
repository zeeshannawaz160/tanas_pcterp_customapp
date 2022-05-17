const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const accountTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Account Type must have a name"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["Asset", "Equity", "Expenses", "Income", "Liability", "Payable"],

    },
    notation: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

accountTypeSchema.plugin(autoIncrement.plugin, {
  model: "AccountType",
  field: "documentId",
});

const AccountType = mongoose.model("AccountType", accountTypeSchema);
module.exports = AccountType;
