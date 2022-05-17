const mongoose = require('mongoose');
const autoIncrement = require("mongoose-auto-increment");


const workCenterSchema = mongoose.Schema({
    name: String,
    code: String,
    alternativeWorkcenter: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkCenter'
        },
        name: String
    }],
    description: String,
    notes: String,
    costPerHour: Number,
    setupTime: String,
    cleanupTime: String,
    capacity: Number
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

workCenterSchema.plugin(autoIncrement.plugin, {
    model: "WorkCenter",
    field: "workCenterId",
    startAt: 1
});


const WorkCenter = mongoose.model('WorkCenter', workCenterSchema);
module.exports = WorkCenter;