const { userAuth } = require("../middlewares/userAuth");
const express = require("express");
const { validateEditProfileData } = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR " + error.message);
  }
});


// profile edit
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
    await loggedInUser.save();
    res.json({message:`${loggedInUser.firstName} your Profile updated successfully`,data:loggedInUser});
  } catch (error) {
    res.status(400).send("ERROR " + error.message);
  }
});

module.exports = profileRouter;
