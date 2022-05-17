const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide permission name!"],
      unique: true,
    },
    code: String,
    description: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Here you can add more field to the base schema of USER
permissionSchema.add({
  levels: [{ type: String, default: ["All"] }],
});

// Here you can add more plugin to the mongoose.Schema()
permissionSchema.plugin(autoIncrement.plugin, {
  model: "Permission",
  field: "documentId",
});
// permissionSchema.plugin(diffHistory.plugin);

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
