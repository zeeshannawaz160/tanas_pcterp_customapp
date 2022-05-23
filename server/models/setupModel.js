const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const schema = mongoose.Schema(
  {
    setupType: {
      type: String,
      enum: ["COMPANY_SETUP", "EMPLOYEE_SETUP", "PURCHASE_SETUP"],
      required: [true, "A Setup must have a unique setup type."],
      unique: true,
    },
  },
  {
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

schema.plugin(autoIncrement.plugin, {
  model: "Setup",
  field: "documentId",
});

const Setup = mongoose.model("Setup", schema);
module.exports = Setup;
