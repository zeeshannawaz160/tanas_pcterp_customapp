const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const productReceiptSchema = mongoose.Schema(
  {
    name: String,
    vendor: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
      name: String
    }],
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    referenceNumber: String,
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    sourceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    backOrderOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductReceipt",
    },
    isFullyReceived: {
      type: Boolean,
      default: false,
    },
    operations: [
      {
        productIdentifier: String,
        product: [{
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          name: String
        }],
        name: String,
        description: String,
        demandQuantity: Number,
        doneQuantity: Number,
      },
    ],
    notes: String,
    status: {
      type: String,
      enum: ["Draft", "Waiting", "Ready", "Done"],
      default: "Ready",
    },
    estimation: {
      untaxedAmount: Number,
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

productReceiptSchema.plugin(autoIncrement.plugin, {
  model: "ProductReceipt",
  field: "documentId",
  startAt: 1,
});

productReceiptSchema.pre("save", async function (next) {
  this.name = "WH/IN/" + padStart(this.productReceiptId, 4, "0");
  next();
});

const ProductReceipt = mongoose.model("ProductReceipt", productReceiptSchema);
module.exports = ProductReceipt;
