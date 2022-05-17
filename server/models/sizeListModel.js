const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const sizeListSchema = mongoose.Schema(
  {
    name: String,
  }
  //   {
  //     toJSON: { virtuals: true },
  //     toObject: { virtuals: true },
  //     timestamps: true,
  //   }
);

const SizeList = mongoose.model("SizeList", sizeListSchema);
module.exports = SizeList;
