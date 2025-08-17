const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Not a validate email id ");
        }
      },
    },
    password: {
      type: String,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please Enter a strong password");
        }
      },
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender  not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Entered url is not valid");
        }
      },
    },
    about: {
      type: String,
      default: "This is the default text ",
    },
    skills: {
      type: [String],
    },
  },
  {
    timeStamps: true,
  }
);


userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    console.log("Password Before Hashing:", user.password);
    user.password = await bcrypt.hash(user.password, 10);
    console.log("Password After Hashing:", user.password);
  }
  next();
});

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "nikhil", {
    expiresIn: "7d",
  });

  return token;
};
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  console.log("Password Match Result:", isPasswordValid);
  return isPasswordValid;
};
module.exports = mongoose.model("User", userSchema);
