const mongoose = require("mongoose");

const baseOptions = {
  discriminatorKey: "__t", // our discriminator key, could be anything
  collection: "testInheritance", // the name of our collection
};

// Our Base schema: these properties will be shared with our "real" schemas
const Base = mongoose.model(
  "Base",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      date_added: { type: Date, default: new Date() },
      redo: { type: Boolean },
    },
    baseOptions
  )
);

//..................................................................//
// const mongoose = require("mongoose");

// const Base = require("./testModel"); // we have to make sure our Book schema is aware of the Base schema

const Book = Base.discriminator(
  "Book",
  new mongoose.Schema({
    author: { type: String },
  })
);

// module.exports = mongoose.model("Book");
// module.exports = mongoose.model("Base");
const base = mongoose.model("Base");
const book = mongoose.model("Book");

module.exports = { base, book };
