const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");
const diffHistory = require("mongoose-diff-history/diffHistory");

// FIELDS ARE >>>
const vendorSchema = mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    address: String,
    gstin: {
      type: String,
    },
    agent: {
      type: String,
    },
    city: {
      type: String,
    },
    market: {
      type: String,
    },
    discountLess: {
      type: Number,
    },
    boxLess: {
      type: Number,
    },
    perPcsLess: {
      type: Number,
    },
    perMeterLess: {
      type: Number,
    },
    bankName: {
      type: String,
    },
    bankBranch: {
      type: String,
    },
    bankAccountNumber: {
      type: Number,
    },
    IFCI: {
      type: String,
    },
    addresses: [
      {
        billing: {
          type: Boolean,
          default: false,
        },
        shipping: {
          type: Boolean,
          default: false,
        },
        default: {
          type: Boolean,
          default: false,
        },
        return: {
          type: Boolean,
          default: false,
        },
        addressee: {
          type: String,
        },
        phone: {
          type: String,
        },
        address1: {
          type: String,
        },
        address: {
          type: String,
        },
        address2: {
          type: String,
        },
        address3: {
          type: String,
        },
        addressee: {
          type: String,
        },
        country: String,
        city: String,
        state: String,
        zip: Number,
      },
    ],
    bills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

vendorSchema.plugin(autoIncrement.plugin, {
  model: "Vendor",
  field: "vendorId",
  startAt: 1,
});
vendorSchema.plugin(diffHistory.plugin, {
  omit: ["updatedAt", "id"],
});
// vendorSchema.pre('save', async function (next) {
//     this.name = "PO" + padStart(this.purchaseOrderId, 4, '0');
//     next();
// });

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
