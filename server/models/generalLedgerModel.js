const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");

// FIELDS ARE >>>
const generalLedgerSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    // dueDate: {
    //     type: Date,
    //     default: Date.now
    // },
    journalLabel: String,
    journal: {
      type: String,
      required: true,
      enum: [
        "Bank",
        "NewBill",
        "ComponentIssue",
        "Invoice",
        "InventoryAdjustment",
        "BillPayment",
        "InvoicePayment",
        "CashSale",
        "JobComplition",
        "CompleteJobOrder",
      ],
      default: "Bank",
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "journal",
    },
    entityType: {
      type: String,
      required: true,
      enum: ["Customer", "Vendor", "Employee", "CashSale"],
      default: "Employee",
    },
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityType",
    },
    reference: String,
    label: String,
    debit: Number,
    credit: Number,
    balance: Number,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

generalLedgerSchema.plugin(autoIncrement.plugin, {
  model: "GeneralLedger",
  field: "generalLedgerId",
});

generalLedgerSchema.pre("save", async function (next) {
  this.balance = parseFloat(this.debit) - parseFloat(this.credit);
  next();
});

const GeneralLedger = mongoose.model("GeneralLedger", generalLedgerSchema);
module.exports = GeneralLedger;
