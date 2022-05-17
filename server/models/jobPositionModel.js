const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");


const jobPositionSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Please enter Job Position Title.']
    },
    jobDescription: String,
    numberOfPerson: {
        type: Number,
        default: 0
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

jobPositionSchema.plugin(autoIncrement.plugin, {
    model: "JobPosition",
    field: "jobPositionId",
});

const JobPosition = mongoose.model('JobPosition', jobPositionSchema);
module.exports = JobPosition;