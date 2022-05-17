const mongoose = require("mongoose");
const validator = require("validator");
const autoIncrement = require("mongoose-auto-increment");
const padStart = require("lodash.padstart");

// FIELDS ARE >>>
const cashSaleSchema = mongoose.Schema(
  {
    name: String,
    customer: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
        },
        name: String,
      },
    ],
    salesRep: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        name: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    products: [
      {
        name: String,
        description: String,
        discountPercentage: Number,
        product: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            name: String,
          },
        ],
        quantity: Number,
        size: String,
        unitRate: Number,
        subTotal: Number,
        mrp: Number,
        salesCode: String,
      },
    ],
    estimation: {
      subTotal: Number,
      discount: Number,
      cgst: Number,
      sgst: Number,
      igst: Number,
      total: Number,
    },
    paymentMode: [
      {
        _id: Number,
        mode: String,
        amount: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

cashSaleSchema.plugin(autoIncrement.plugin, {
  model: "CashSale",
  field: "cashSaleId",
});

cashSaleSchema.pre("save", async function (next) {
  this.name = "CS" + padStart(this.cashSaleId, 4, "0");
  next();
});

const CashSale = mongoose.model("CashSale", cashSaleSchema);
module.exports = CashSale;

// Old code

// const mongoose = require("mongoose");
// const validator = require("validator");
// const autoIncrement = require("mongoose-auto-increment");

// // FIELDS ARE >>>
// const cashSaleSchema = mongoose.Schema(
//   {
//     customer: [
//       {
//         id: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Customer",
//         },
//         name: String,
//       },
//     ],
//     salesRep: [
//       {
//         id: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Employee",
//         },
//         name: String,
//       },
//     ],
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//     products: [
//       {
//         name: String,
//         description: String,
//         product: [
//           {
//             id: {
//               type: mongoose.Schema.Types.ObjectId,
//               ref: "Product",
//             },
//             name: String,
//           },
//         ],
//         quantity: Number,
//         size: Number,
//         unitRate: Number,
//         subTotal: Number,
//         mrp: Number,
//       },
//     ],
//     estimation: {
//       subTotal: Number,
//       cgst: Number,
//       sgst: Number,
//       total: Number,
//     },
//     paymentMode: [
//       {
//         _id: Number,
//         mode: String,
//         amount: Number,
//       },
//     ],
//   },
//   {
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//     timestamps: true,
//   }
// );

// cashSaleSchema.plugin(autoIncrement.plugin, {
//   model: "CashSale",
//   field: "cashSaleId",
// });

// const CashSale = mongoose.model("CashSale", cashSaleSchema);
// module.exports = CashSale;

// Old code
