const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const diffHistory = require("mongoose-diff-history/diffHistory");

// FIELDS ARE >>>
const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Customer must have a name"],
      trim: true,
    },
    phone: Number,
    address: String,
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    gstin: {
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
        address2: {
          type: String,
        },
        address3: {
          type: String,
        },
        address: {
          type: String,
        },
        country: String,
        city: String,
        state: String,
        zip: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

customerSchema.plugin(autoIncrement.plugin, {
  model: "Customer",
  field: "documentId",
});

customerSchema.plugin(diffHistory.plugin, {
  omit: ["updatedAt", "id"],
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
