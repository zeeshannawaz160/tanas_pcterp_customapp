const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");
const Employee = require("./employeeModel");

// FIELDS ARE >>>
const bomSchema = mongoose.Schema(
  {
    product: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String
    }],
    name: String,

    unit: [{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UOM",
      },
      name: String
    }],

    notes: String,
    components: [
      {
        component: [{
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          name: String
        }],
        quantity: Number,
        unit: [{
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UOM",
          },
          name: String
        }]
      },
    ],
    operations: [
      {
        operation: String,
        steps: Number,
        workCenter: [{
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkCenter",
          },
          name: String
        }],
        duration: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

bomSchema.plugin(autoIncrement.plugin, {
  model: "BOM",
  field: "documentId",
});

const BOM = mongoose.model("BOM", bomSchema);
module.exports = BOM;
