const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();
//sign up user
authRouter.post("/signup", async (req, res) => {
  try {
    //validate the data
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    //encrypting the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      firstName,
      lastName,
      emailId,
      password,
    });

    await userData.save();
    res.send("User data saved successfully");
  } catch (error) {
    res.status(400).send("ERROR " + error.message);
  }
});

//login user

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("User does not exist");
    } else {
      const isDecrypted = await user.validatePassword(password);
      console.log({ isDecrypted });

      if (isDecrypted) {
        // create a JWT token
        const token = await user.getJWT();

        //add the token to cookie and send the response back to the user

        res.cookie("token", token, {
          expires: new Date(Date.now() + 4 * 3600000),
        });

        res.send({ message: "User logged in successfully!!", data: user });
      } else {
        throw new Error("User creds not valid......");
      }
    }
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.send("user logged out successfully");
});

module.exports = authRouter;
