const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
const appNavigationCenterSchema = mongoose.Schema(
    {
        name: {
            type: String,
            unique: true
        },
        type: String,
        appLink: String,
        appNavigationTabs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AppNavigationTab'
        }]

    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

// Here you can add more field to the base schema of USER
appNavigationCenterSchema.add({

});

appNavigationCenterSchema.plugin(autoIncrement.plugin, {
    model: "AppNavigationCenter",
    field: "documentId",
});

appNavigationCenterSchema.pre('save', async function (next) {
    this.type = this.name.replace(/\s/g, "");
    next();
});


const AppNavigationCenter = mongoose.model("AppNavigationCenter", appNavigationCenterSchema);
module.exports = AppNavigationCenter;
