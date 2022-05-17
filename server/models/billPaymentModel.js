const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const billPaymentSchema = mongoose.Schema(
  {
    name: String,
    journalType: String,
    referenceNumber: String,
    bankAccount: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        name: String,
      },
    ],
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewBill",
    },
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    amount: Number,
    referenceNumber: String,
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

billPaymentSchema.plugin(autoIncrement.plugin, {
  model: "BillPayment",
  field: "billPaymentId",
  startAt: 1,
});

billPaymentSchema.pre("save", async function (next) {
  this.name =
    "BNK/2021/11/" + padStart(this.billPaymentId, 4, "0") + " - " + this.memo;
  next();
});

const BillPayment = mongoose.model("BillPayment", billPaymentSchema);
module.exports = BillPayment;
