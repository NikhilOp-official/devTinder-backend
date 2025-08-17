const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://nikhilchaurasia70:VXFIxiDuZMwLhU1U@nikhil.9e9u6.mongodb.net/devTinder"
  );
};
module.exports = connectDB;
