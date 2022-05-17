const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const departmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: [true, 'Please enter Department Name.']
        },
        supervisor: [
            {
                id: String,
                name: String,
            },
        ],
        parentDepartment: [
            {
                id: String,
                name: String,
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
);

departmentSchema.plugin(autoIncrement.plugin, {
    model: "Department",
    field: "documentId",
});

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
