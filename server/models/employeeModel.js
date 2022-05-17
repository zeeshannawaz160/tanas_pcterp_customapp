const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const autoIncrement = require("mongoose-auto-increment");
const diffHistory = require('mongoose-diff-history/diffHistory')
const AppError = require("../utils/appError");

// FIELDS ARE >>>

const employeeSchema = mongoose.Schema(
  {
    salutation: String,
    ip: String,
    lastLoggedAt: Date,
    giveAccess: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
      required: [true, "A User must have a name"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    name: String,
    jobTitle: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JobPosition",
        },
        name: String,
      },
    ],
    roles: [
      {
        name: String,
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      },
    ],
    notes: String,
    email: {
      type: String,
      required: [true, "A User must have a unique email id."],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      trim: true,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Password are not the same",
      },
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    phone: String,
    address: String,
    supervisor: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        name: String,
      },
    ],
    department: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Department",
        },
        name: String,
      },
    ],
    location: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
        },
        name: String,
      },
    ],
    photo: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

employeeSchema.plugin(autoIncrement.plugin, {
  model: "Employee",
  field: "documentId",
});
employeeSchema.plugin(diffHistory.plugin, {
  omit: [
    'passwordChangedAt',
    'passwordResetToken',
    'passwordResetExpires',
    'lastLoggedAt',
    'updatedAt',
    'id',
    'lastLoggedAt',
    'passwordConfirm'
  ]
});

// This block of code is responsible to hide the badge id in db
employeeSchema.pre("save", async function (next) {
  this.name = this.firstName + " " + this.lastName;
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the badgeId with cost of 12
  this.password = await bcrypt.hash(this.password, 8);

  // Delete badgeIdConfirm field
  this.passwordConfirm = undefined;
  next();
});

// On update of an employee set the name with updated name
employeeSchema.pre("findOneAndUpdate", async function (next) {
  // console.log(this);
  // Find current model data before update

  const docToUpdate = await this.model.findOne({ _id: this._conditions._id });
  // console.log("docToUpdate: ", docToUpdate);

  // on any update on employee run if part and update password through UI run else part
  if (this._update.firstName) {
    this._update.name = this._update.firstName + " " + this._update.lastName;
  } else {
    this.name = docToUpdate?.name;
  }
  next();
});

// employeeSchema.pre(
//   ["updateOne", "findOneAndUpdate"],
//   async function (req, next) {
//     if (!this.getUpdate().giveAccess) next();

//     console.log("update data: ", this);
//     const userDocuments = await this.model.find({ giveAccess: { $eq: true } });
//     if (parseInt(process.env.MAX_USER_COUNT) <= userDocuments.length) {
//       return next(
//         new AppError(
//           "You cannot give access to this user! You have already reached maximum user limit!",
//           400
//         )
//       );
//     }

//     next();
//   }
// );

employeeSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  if (!this.getUpdate().giveAccess) next();

  const userDocuments = await this.model.find({ giveAccess: { $eq: true } });

  if (this._update.giveAccess) {
    let isValidUser = false;

    userDocuments.map((e) => {
      if (e._id == this._update._id) isValidUser = true;
    });

    if (!isValidUser) {
      if (parseInt(process.env.MAX_USER_COUNT) <= userDocuments.length) {
        return next(
          new AppError(
            "You cannot give access to this user! You have already reached maximum user limit!",
            400
          )
        );
      }
    }
  }

  next();
});

employeeSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.badgeIdChangedAt) {
    const changedTimestamp = parseInt(
      this.badgeIdChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // FALSE means NOT Changed
  return false;
};

employeeSchema.methods.isOldToken = function (JWTTimestamp) {
  if (this.lastLoggedAt) {
    const changedTimestamp = parseInt(
      this.lastLoggedAt.getTime() / 1000,

      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed

  return false;
};

employeeSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  console.log("RESET TOKEN: " + resetToken);

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log("PASSWORD RESET TOKEN: " + this.passwordResetToken);
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min from now

  return resetToken;
};

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
