const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");


// FIELDS ARE >>>
const appCenterSchema = mongoose.Schema(
    {
        name: String,
        abbreviation: String,
        link: String,
        icon: String,
        color: {
            type: String,
            default: "#009999"
        },
        backgroundColor: {
            type: String,
            default: "#D1F2EB"
        },
        navCneterLink: mongoose.Schema.Types.ObjectId,
        docType: mongoose.Schema.Types.ObjectId,

    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

// Here you can add more field to the base schema of USER
appCenterSchema.add({

});

appCenterSchema.plugin(autoIncrement.plugin, {
    model: "AppCenter",
    field: "documentId",
});

// appCenterSchema.pre('save', async function (next) {
//     this.modelName = this.documentTypeName.replace(/\s/g, "");
//     next();
// });


const AppCenter = mongoose.model("AppCenter", appCenterSchema);
module.exports = AppCenter;
