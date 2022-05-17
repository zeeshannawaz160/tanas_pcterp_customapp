const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");
const diffHistory = require("mongoose-diff-history/diffHistory");

const purchaseOrderSchema = mongoose.Schema(
  {
    name: String,
    vendor: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
        },
        name: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    bill: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "newBill",
        },
        name: String,
      },
    ],
    receiptDate: {
      type: Date,
      default: Date.now,
    },
    productReceipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductReceipt",
    },
    isFullyReceived: {
      type: Boolean,
      default: false,
    },
    referenceNumber: String,
    vendorBill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    isFullyBilled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["RFQ", "RFQ Sent", "Purchase Order"],
      default: "Purchase Order",
    },
    billingStatus: {
      type: String,
      enum: [
        "Nothing to Bill",
        "Waiting Bills",
        "Fully Billed",
        "Fully Received / Partially billed",
        "Partially Received / Billed",
      ],
      default: "Nothing to Bill",
    },
    purchaseRep: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        name: String,
      },
    ],
    termsAndConditions: String,
    remark: String,
    products: [
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
        name: String,
        description: String,
        size: Number,
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
        received: { type: Number, default: 0 },
        billed: { type: Number, default: 0 },
        taxes: [String],
        HSNSACS: Number,
        cgstRate: Number,
        cgst: Number,
        sgstRate: Number,
        sgst: Number,
        igstRate: Number,
        igst: Number,
        discount: String,
        unitPrice: Number,
        salesPrice: Number,
        subTotal: Number,
        netAmount: Number,
        index: Number,
        account: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Account",
            },
            name: String,
          },
        ],
      },
    ],
    estimation: {
      untaxedAmount: Number,
      tax: Number,
      discount: Number,
      igst: Number,
      cgst: Number,
      sgst: Number,
      total: Number,
    },
    total: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

purchaseOrderSchema.plugin(autoIncrement.plugin, {
  model: "PurchaseOrder",
  field: "documentId",
  startAt: 1,
});

purchaseOrderSchema.plugin(diffHistory.plugin, {
  omit: ["updatedAt", "id", "estimation"],
});

purchaseOrderSchema.pre("save", async function (next) {
  this.name = "PO" + padStart(this.documentId, 4, "0");
  next();
});

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
module.exports = PurchaseOrder;
