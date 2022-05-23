const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const newBillSchema = mongoose.Schema(
  {
    name: String,
    sourceDocumentArray: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PurchaseOrder",
        },
        name: String,
      },
    ],
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    attachedPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    vendorArray: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
        },
        name: String,
      },
    ],
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    referenceNumber: String,
    billDate: {
      type: Date,
      default: Date.now,
    },
    recepientAccountArray: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        name: String,
      },
    ],
    recepientAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },
    paymentStatus: {
      type: String,
      enum: ["Not Paid", "Partially Paid", "Paid"],
      default: "Not Paid",
    },
    total: Number,
    remainAmountToPay: {
      type: Number,
      default: false,
    },
    isStandalone: {
      type: Boolean,
      default: false,
    },
    invoiceLines: [
      {
        productArray: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            name: String,
          },
        ],
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        label: String,
        accountArray: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Account",
            },
            name: String,
          },
        ],
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        unitArray: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "UOM",
            },
            name: String,
          },
        ],
        unit: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UOM",
        },
        quantity: Number,
        unitPrice: Number,
        hsnCode: String,
        taxes: [Number],
        sgst: Number,
        cgst: Number,
        subTotal: Number,
        purchaseOrder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PurchaseOrder",
        },
      },
    ],
    journalItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        accountArray: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Account",
            },
            name: String,
          },
        ],
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        taxes: Number,
        label: String,
        debit: Number,
        credit: Number,
      },
    ],
    estimation: {
      untaxedAmount: Number,
      tax: Number,
      igst: Number,
      cgst: Number,
      sgst: Number,
      total: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

newBillSchema.plugin(autoIncrement.plugin, {
  model: "NewBill",
  field: "billId",
  startAt: 1,
});

newBillSchema.pre("save", async function (next) {
  this.name = "BILL/2022/11/" + padStart(this.billId, 4, "0");
  next();
});

const NewBill = mongoose.model("NewBill", newBillSchema);
module.exports = NewBill;
