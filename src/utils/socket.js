const socketIo = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};
const getTokenFromCookies = (cookieHeader = "") => {
  const tokenCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : null;
};

const hasAcceptedConnection = (userId, targetUserId) =>
  ConnectionRequest.exists({
    status: "accepted",
    $or: [
      { fromUserId: userId, toUserId: targetUserId },
      { fromUserId: targetUserId, toUserId: userId },
    ],
  });

const findOrCreateChat = async (userId, targetUserId) => {
  const pairKey = [userId.toString(), targetUserId.toString()].sort().join(":");
  const existingChat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });
  if (existingChat) {
    if (!existingChat.pairKey) {
      existingChat.pairKey = pairKey;
      await existingChat.save();
    }
    return existingChat;
  }
  return Chat.findOneAndUpdate(
    { pairKey },
    { $setOnInsert: { pairKey, participants: [userId, targetUserId], messages: [] } },
    { new: true, upsert: true },
  );
};

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
      const token = getTokenFromCookies(socket.handshake.headers.cookie);
      if (!token) throw new Error("Authentication required");
      const { _id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(_id);
      if (!user) throw new Error("User not found");
      socket.user = user;
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const getAuthorizedRoom = async (targetUserId) => {
      const isConnected = await hasAcceptedConnection(socket.user._id, targetUserId);
      if (!isConnected) throw new Error("You can only chat with accepted connections");
      return getSecretRoomId(socket.user._id, targetUserId);
    };

    socket.on("joinChat", async ({ targetUserId } = {}) => {
      try {
        socket.join(await getAuthorizedRoom(targetUserId));
      } catch (error) {
        socket.emit("chatError", { message: error.message });
      }
    });
    socket.on(
      "sendMessage",
      async ({ targetUserId, text } = {}) => {
        try {
          const normalizedText = text?.trim();
          if (!normalizedText || normalizedText.length > 2000) {
            throw new Error("Message must be between 1 and 2000 characters");
          }
          const roomId = await getAuthorizedRoom(targetUserId);
          socket.join(roomId);
          const chat = await findOrCreateChat(socket.user._id, targetUserId);
          chat.messages.push({ senderId: socket.user._id, text: normalizedText });
          await chat.save();
          const message = chat.messages.at(-1);
          io.to(roomId).emit("messageReceived", {
            senderId: socket.user._id.toString(),
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            text: message.text,
            createdAt: message.createdAt,
          });
        } catch (error) {
          socket.emit("chatError", { message: error.message });
        }
      },
    );
  });
};

module.exports = initializeSocket;
