const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

const salesOrderSchema = mongoose.Schema(
  {
    name: String,
    customer: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
        },
        name: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      required: [true, "Must have a delivery date!!!"],
    },
    productDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductDelivery",
      default: null,
    },
    isFullyDelivered: {
      type: Boolean,
      default: false,
    },
    customerInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    isFullyInvoiced: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Quotation", "Quotation Sent", "Sales Order"],
      default: "Sales Order",
    },
    invoiceStatus: {
      type: String,
      enum: [
        "Nothing to Invoice",
        "To Invoice",
        "Fully Invoiced",
        "Partially Delivered / Invoiced",
        "Fully Delivered / Partially Invoiced",
      ],
      default: "Nothing to Invoice",
    },
    salesRep: [
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
    billingAddress: String,
    shippingAddress: String,
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
        delivered: { type: Number, default: 0 },
        invoiced: { type: Number, default: 0 },
        taxes: [String],
        cgstRate: Number,
        cgst: Number,
        sgstRate: Number,
        sgst: Number,
        igstRate: Number,
        igst: Number,
        discount: String,
        unitPrice: Number,
        subTotal: Number,
        netAmount: Number,
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
      discount: String,
      sgst: Number,
      cgst: Number,
      igst: Number,
      total: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

salesOrderSchema.plugin(autoIncrement.plugin, {
  model: "SalesOrder",
  field: "salesOrderId",
  startAt: 1,
});

salesOrderSchema.pre("save", async function (next) {
  this.name = "SO" + padStart(this.salesOrderId, 4, "0");
  next();
});
const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);

module.exports = SalesOrder;
