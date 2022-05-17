const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast((v) => (v === "" ? v : castObjectId(v)));

const uomSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "A Product must have a name"],
        trim: true,
    },
    description: String,
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);

uomSchema.plugin(autoIncrement.plugin, {
    model: "UOM",
    field: "uomId",
});

const UOM = mongoose.model("UOM", uomSchema);

module.exports = UOM;