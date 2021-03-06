const Customer = require("../models/customerModel");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const diffHistory = require("mongoose-diff-history/diffHistory");

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

  if (!doc) return next(new AppError("Document not found!", 400));

  const historiesDoc = await diffHistory.getDiffs("Customer", doc._id, []);

  res.status(200).json({
    isSuccess: true,
    status: "success",
    results: historiesDoc.length,
    documents: historiesDoc,
  });
});

/**
 * Title: Import bulk customer data
 * Request: GET
 * Routes: api/v1/customer/import
 *
 * Method description:
 * This method will import bulk customer data into database
 *
 * Changes Log:
 * 20-05-2022: Biswajit create the method.
 *
 */
exports.importCustomer = catchAsync(async (req, res, next) => {
  console.log("hi");
  let customerArray = new Array();

  await Promise.all(
    req.body?.map((e) => {
      let customerObj = new Object();
      let addressObj = new Object();
      let addressArray = new Array();

      customerObj.name = e.CUSTOMERNAME;
      customerObj.phone = e.PHONE;
      if (e.DEFAULT) {
        customerObj.address = e.ADDRESS;
      }
      customerObj.gstin = e.GSTIN;
      customerObj.email = e.EMAIL;
      addressObj.billing = e.BILLING;
      addressObj.shipping = e.SHIPPING;
      addressObj.default = e.DEFAULT;
      addressObj.return = e.RETURN;
      addressObj.country = e.COUNTRY;
      addressObj.state = e.STATE;
      addressObj.city = e.CITY;
      addressObj.zip = e.zip;
      addressObj.phone = e.PHONE;
      addressObj.address = e.ADDRESS;
      addressObj.addressee = e.ADDRESSEE;
      addressObj.address1 = e.ADDRESS1;
      addressObj.address2 = e.ADDRESS2;
      addressObj.address3 = e.ADDRESS3;
      addressArray.push(addressObj);

      customerObj.addresses = addressArray;

      customerArray.push(customerObj);
    })
  );

  console.log("array: ", customerArray);

  const docs = await Customer.insertMany(customerArray, function (error, doc) {
    console.log("error: ", error);
    if (error) {
      return next(new AppError("Customers has not been imported", 404));
    }
  });

  res.status(200).json({
    isSuccess: true,
    status: "success",
    documents: docs,
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