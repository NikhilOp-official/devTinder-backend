//find user by emailid
app.get("/user", async (req, res) => {
  try {
    const user = await User.find({ emailId: req.body.emailId });

    if (user.length === 0) {
      res.status(404).send("No User Found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.send("Error occured while fetching user");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const getAllFeed = await User.find({});
    if (getAllFeed.length === 0) {
      res.status(404).send("No feed available");
    } else {
      res.send(getAllFeed);
    }
  } catch (error) {
    res.send("Error occured while fetching feed");
  }
});
app.delete("/user", async (req, res) => {
  const userId = req.body.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (deletedUser) {
      res.send({ message: "User Deleted Successfully", deletedUser });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error occurred while deleting user",
      error: error.message,
    });
  }
});
