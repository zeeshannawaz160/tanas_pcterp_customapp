const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");


const jobOrderSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        default: 1
    },
    scheduledDate: {
        type: Date,
        default: Date.now
    },
    responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    notes: String,
    components: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            default: 1
        },
        unit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UOM"
        }
    }],
    operations: [{
        operation: String,
        steps: Number,
        workCenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkCenter",
        },
        // scheduledStartDate: {
        //     type: Date,
        //     default: Date.now
        // },
        // scheduledEndDate: {
        //     type: Date,
        // },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        expectedDuration: String,
        realDuration: String,
        status: {
            type: String,
            enum: ['Waiting', 'In Progress', 'Done'],
            default: 'Waiting'
        }
    }]

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

jobOrderSchema.plugin(autoIncrement.plugin, {
    model: "JobOrder",
    field: "jobOrderId",
});

const JobOrder = mongoose.model('JobOrder', jobOrderSchema);
module.exports = JobOrder;