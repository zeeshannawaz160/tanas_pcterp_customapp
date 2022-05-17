const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const invoiceSchema = mongoose.Schema(
  {
    name: String,
    sourceDocument: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SalesOrder",
        },
        name: String,
      },
    ],
    customer: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "customer",
        },
        name: String,
      },
    ],
    paymentReference: String,
    referenceNumber: {
      type: String,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    recepientAccount: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        name: String,
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },
    paymentStatus: {
      type: String,
      enum: ["Not Paid", "Paid"],
      default: "Not Paid",
    },
    total: Number,
    totalTaxAmount: Number,
    isStandalone: {
      type: Boolean,
      default: false,
    },
    invoiceLines: [
      {
        product: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            name: String,
          },
        ],
        label: String,
        account: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Account",
            },
            name: String,
          },
        ],
        unit: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "UOM",
            },
            name: String,
          },
        ],
        quantity: Number,
        unitPrice: Number,
        taxes: [Number],
        // taxes: Number,
        subTotal: Number,
        salesOrder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SalesOrder",
        },
      },
    ],
    journalItems: [
      {
        product: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            name: String,
          },
        ],
        account: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Account",
            },
            name: String,
          },
        ],
        taxes: [Number],
        label: String,
        debit: Number,
        credit: Number,
      },
    ],
    estimation: {
      untaxedAmount: Number,
      igst: Number,
      cgst: Number,
      sgst: Number,
      tax: Number,
      total: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

invoiceSchema.plugin(autoIncrement.plugin, {
  model: "Invoice",
  field: "invoiceId",
  startAt: 1,
});

invoiceSchema.pre("save", async function (next) {
  this.name = "INVOICE/2021/11/" + padStart(this.invoiceId, 4, "0");
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
