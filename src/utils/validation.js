const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error("Enter a valid name");
  } else if (!validator.isEmail(emailId || "")) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password || "")) {
    throw new Error("Please enter a strong password");
  }
};
const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "about",
    "age",
    "photoUrl",
    "skills",
    "gender",
  ];

  const isAllowed = Object.keys(req.body).every((fields) =>
    allowedEditFields.includes(fields)
  );
  return isAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
