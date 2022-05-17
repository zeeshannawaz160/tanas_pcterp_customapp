const fs = require("fs");

const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");

exports.getCountriesAndStates = catchAsync(async (req, res, next) => {
  fs.readFile("./data/countries-states.json", (err, data) => {
    if (err) {
      throw err;
    }

    const countriesAndStates = JSON.parse(data);

    const document = countriesAndStates;

    res.status(200).json({
      isSuccess: true,

      status: "success",

      documents: document,
    });
  });
});

exports.getCountries = catchAsync(async (req, res, next) => {
  fs.readFile("./data/countries.json", (err, data) => {
    if (err) {
      throw err;
    }

    const countries = JSON.parse(data);

    const document = countries;

    res.status(200).json({
      isSuccess: true,

      status: "success",

      documents: document,
    });
  });
});

exports.getStates = catchAsync(async (req, res, next) => {
  const countryName = req.params.id;

  fs.readFile("./data/states.json", (err, data) => {
    if (err) {
      throw err;
    }

    const states = JSON.parse(data);

    const document = states.filter((e) => e.country_name === countryName);

    res.status(200).json({
      isSuccess: true,

      status: "success",

      documents: document,
    });
  });
});
