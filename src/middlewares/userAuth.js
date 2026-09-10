const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //read the token from the cookie
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please login again");
    }
    //validate the token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedObj;

    //find the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).send("Please login again");
  }
};
module.exports = {
  userAuth,
};
