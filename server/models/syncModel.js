const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const syncSchema = mongoose.Schema({
    lastSync: {
        type: Date,
        default: Date.now
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);

syncSchema.plugin(autoIncrement.plugin, {
    model: "Sync",
    field: "syncId",
});

const Sync = mongoose.model("Sync", syncSchema);

module.exports = Sync;