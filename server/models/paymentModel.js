const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

// FIELDS ARE >>>
const paymentSchema = mongoose.Schema(
  {
    name: String,
    journalType: String,
    recipientAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    amount: Number,
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    memo: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

paymentSchema.plugin(autoIncrement.plugin, {
  model: "Payment",
  field: "paymentId",
  startAt: 1,
});

paymentSchema.pre("save", async function (next) {
  this.name =
    "BNK/2021/11/" + padStart(this.paymentId, 4, "0") + " - " + this.memo;
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
