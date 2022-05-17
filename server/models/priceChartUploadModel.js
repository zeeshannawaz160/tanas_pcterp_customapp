const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const priceChartSchema = mongoose.Schema(
  {
    range0: Number,
    range1: Number,
    expense: Number,
    otherPercentage: Number,
    profitPercentage: Number,
    gstPercentage: Number,
    basicCalculation: Number,
    oldSystemCalculation: Number,
    difference: Number,
    otherDifference: Number,
    MRP: Number,
  }
  //   {
  //     toJSON: { virtuals: true },
  //     toObject: { virtuals: true },
  //     timestamps: true,
  //   }
);

const PriceChartUpload = mongoose.model("PriceChartUpload", priceChartSchema);
module.exports = PriceChartUpload;
