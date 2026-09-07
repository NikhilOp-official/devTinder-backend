require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/user");
const initializeSocket = require("./utils/socket");
require("./utils/cronjob");

const cors = require("cors");
const http = require("http");
const chatRouter = require("./routers/chat");
const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  }),
);
app.use(express.json()); //this will be used as the  middleware which will convert all  the requested json data to javascript object
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(process.env.PORT, () => {
      console.log("Server started successfully on port 7777.....");
    });
  })
  .catch((e) => {
    console.log("An error occured while connecting  to the databse");
  });
