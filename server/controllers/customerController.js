const Customer = require("../models/customerModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const diffHistory = require('mongoose-diff-history/diffHistory')

exports.getAllCustomers = factory.getAll(Customer);
exports.getCustomer = factory.getOne(Customer);
exports.createCustomer = factory.createOne(Customer);
exports.updateCustomer = factory.updateOne(Customer);
exports.deleteCustomer = factory.deleteOne(Customer);

exports.getList = catchAsync(async (req, res, next) => {
  const document = await Customer.find().select("id name");
  console.log(document);
  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: document,
  });

  //const document = await Item.find({ name: });
});

exports.getHistories = catchAsync(async (req, res) => {

  const doc = await Customer.findById(req.params.id);

  if (!doc)
    return next(
      new AppError(
        'Document not found!',
        400
      ));

  const historiesDoc = await diffHistory.getDiffs("Customer", doc._id, []);

  res.status(200).json({
    isSuccess: true,
    status: 'success',
    results: historiesDoc.length,
    documents: historiesDoc
  });
});

exports.deleteAllCustomers = catchAsync(async (req, res, next) => {
  await Customer.deleteMany();

  res.status(204).json({
    isSuccess: true,
    status: "success",
    document: null,
  });
})

exports.importCustomer = catchAsync(async (req, res, next) => {
  // console.log(req.body);

  const customersData = req.body;
  let customers = [];
  customersData.map(customer => {
    let existingCustomer = customers?.filter(e => e.EMAIL === customer.EMAIL);
    if (existingCustomer !== []) {
      customers.push({
        name: customer?.['CUSTOMER NAME'],
        phone: customer?.PHONE,
        address: customer?.ADDRESS,
        email: customer?.EMAIL,
        gstin: customer?.GSTIN,
        addresses: [{
          phone: customer?.PHONE,
          billing: customer?.BILLING,
          shipping: customer?.SHIPPING,
          default: customer?.DEFAULT,
          return: customer?.RETURN,
          addressee: customer?.ADDRESSEE,
          address1: customer?.ADDRESS1,
          address2: customer?.ADDRESS2,
          address3: customer?.ADDRESS3,
          address: customer?.ADDRESS,
          country: customer?.COUNTRY,
          city: customer?.CITY,
          state: customer?.STATE,
          zip: customer?.ZIP
        }]
      })
    } else {
      const existingCustomerIndex = customers[existingCustomer[0]];
      existingCustomer[0].addresses.push({
        phone: customer?.PHONE,
        billing: customer?.BILLING,
        shipping: customer?.SHIPPING,
        default: customer?.DEFAULT,
        return: customer?.RETURN,
        addressee: customer?.ADDRESSEE,
        address1: customer?.ADDRESS1,
        address2: customer?.ADDRESS2,
        address3: customer?.ADDRESS3,
        address: customer?.ADDRESS,
        country: customer?.COUNTRY,
        city: customer?.CITY,
        state: customer?.STATE,
        zip: customer?.ZIP
      })

      customers[existingCustomerIndex] = existingCustomer[0];
    }

  })


  await Customer.insertMany(customers)
    .then(function () {
      console.log("DATA INSERTED");
    })
    .catch(function (error) {
      console.log(error);
    });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: null,
  });
});