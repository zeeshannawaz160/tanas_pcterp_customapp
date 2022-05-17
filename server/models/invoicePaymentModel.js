const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const invoicePaymentSchema = mongoose.Schema(
  {
    name: String,
    journalType: String,
    bankAccount: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        name: String,
      },
    ],
    SOId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
    },
    referenceNumber: Number,
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
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

invoicePaymentSchema.plugin(autoIncrement.plugin, {
  model: "InvoicePayment",
  field: "invoicePaymentId",
  startAt: 1,
});

invoicePaymentSchema.pre("save", async function (next) {
  this.name =
    "BNK/2021/11/" +
    padStart(this.invoicePaymentId, 4, "0") +
    " - " +
    this.memo;
  next();
});

const InvoicePayment = mongoose.model("InvoicePayment", invoicePaymentSchema);
module.exports = InvoicePayment;
