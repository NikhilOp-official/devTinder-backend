const express = require("express");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/userAuth");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;
    const isConnected = await ConnectionRequest.exists({
      status: "accepted",
      $or: [
        { fromUserId: userId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: userId },
      ],
    });
    if (!isConnected) {
      return res.status(403).json({ message: "You can only chat with accepted connections" });
    }

    const pairKey = [userId.toString(), targetUserId].sort().join(":");
    let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });
    if (chat) {
      if (!chat.pairKey) {
        chat.pairKey = pairKey;
        await chat.save();
      }
    } else {
      chat = await Chat.findOneAndUpdate(
        { pairKey },
        { $setOnInsert: { pairKey, participants: [userId, targetUserId], messages: [] } },
        { new: true, upsert: true },
      );
    }
    await chat.populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = chatRouter;
