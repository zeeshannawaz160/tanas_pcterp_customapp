const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast((v) => (v === "" ? v : castObjectId(v)));

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Item must have a name"],
      trim: true,
    },
    description: String,
    salesPrice: Number,
    barcode: String,
    totalPurchasedQuantity: Number,
    totalInQuantity: Number,
    totalOutQuantity: Number,
    location: String,
    onHand: Number,
    available: Number,
    commited: Number,
    averageCost: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// itemSchema.plugin(autoIncrement.plugin, {
//     model: "Item",
//     field: "itemId"
// })

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
