const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const companySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Company must have a name"],
      trim: true,
    },
    phone: Number,
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    logoPath: String,
    logoName: String,
    address: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

companySchema.plugin(autoIncrement.plugin, {
  model: "Company",
  field: "companyId",
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
