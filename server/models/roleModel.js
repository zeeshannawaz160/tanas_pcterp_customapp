const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");
const diffHistory = require('mongoose-diff-history/diffHistory')

// FIELDS ARE >>>
const roleSchema = mongoose.Schema(
  {
    name: String,
    description: String,
    permissions: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
        name: String,
        code: String,
        level: String,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

roleSchema.plugin(autoIncrement.plugin, {
  model: "Role",
  field: "documentId",
});

roleSchema.plugin(diffHistory.plugin, {
  omit: [
    'updatedAt',
    'id'
  ]
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
