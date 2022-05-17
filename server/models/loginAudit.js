const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const loginAuditSchema = mongoose.Schema({
    status: String,
    ipAddress: String,
    webBrowser: String,
    requestUrl: String,
    user: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

loginAuditSchema.plugin(autoIncrement.plugin, {
    model: "LoginAudit",
    field: "loginAuditId"
});


const LoginAudit = mongoose.model('LoginAudit', loginAuditSchema);
module.exports = LoginAudit;