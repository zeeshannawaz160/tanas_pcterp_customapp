const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast((v) => (v === "" ? v : castObjectId(v)));

const itemFulfillmentSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    createdFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    total: Number,
    isFulfill: {
      type: Boolean,
      default: false,
    },
    // status: {
    //   type: String,
    //   enum: ["Waiting Fulfillment", "Fulfill"],
    //   default: "Waiting Fulfillment",
    // },
    shipAddress: String,
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        description: String,
        quantity: Number,
        unitPrice: Number,
        subTotal: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

itemFulfillmentSchema.plugin(autoIncrement.plugin, {
  model: "ItemFulfillment",
  field: "ItemFulfillmentId",
});

const ItemFulfillment = mongoose.model(
  "ItemFulfillment",
  itemFulfillmentSchema
);

module.exports = ItemFulfillment;
