require("dotenv").config();
const cors = require("cors");
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const DB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // ← NEW

const app = express();

// DATABASE
DB();

// MIDDLEWARE
const allowedOrigins = [
  "http://localhost:5173",
  "https://dev-hub-frontend-tys.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// Uploads — images browser mein dikhte hain, baaki sab force download
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
app.use("/uploads", (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (!IMAGE_EXTS.includes(ext)) {
    const filename = path.basename(req.path);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }
  next();
}, express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/upload", uploadRoutes); // ← NEW

// CREATE HTTP SERVER
const server = http.createServer(app);

// SOCKET SERVER
const io = new Server(server, {
  cors: { origin: "*" }
});

// ONLINE USERS — userId → socketId
const onlineUsers = new Map();

// Helper: online user IDs list
const getOnlineUserIds = () => Array.from(onlineUsers.keys());

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // ── USER JOIN ──────────────────────────────────────────────────────────────
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);

    // Sabko updated online list bhejo
    io.emit("onlineUsers", getOnlineUserIds());

    console.log("Online Users:", [...onlineUsers.keys()]);
  });

  // ── SEND MESSAGE ───────────────────────────────────────────────────────────
  socket.on("sendMessage", (messageData) => {
    const receiverId = messageData.receiverId || messageData.receiver;
    const receiverSocketId = onlineUsers.get(receiverId?.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", messageData);
    }
  });

  // ── TYPING INDICATOR ───────────────────────────────────────────────────────
  // Frontend emit: socket.emit('typing', { to: activeUser._id, from: user._id })
  socket.on("typing", ({ to, from }) => {
    const receiverSocketId = onlineUsers.get(to?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from });
    }
  });

  // ── MESSAGE SEEN ───────────────────────────────────────────────────────────
  // Frontend emit: socket.emit('messageSeen', { msgId, to: senderId })
  socket.on("messageSeen", ({ msgId, to }) => {
    const senderSocketId = onlineUsers.get(to?.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", { msgId });
    }
  });

  // ── REACTION ───────────────────────────────────────────────────────────────
  // Frontend emit: socket.emit('reaction', { msgId, emoji, to: activeUser._id })
  socket.on("reaction", ({ msgId, emoji, to }) => {
    const receiverSocketId = onlineUsers.get(to?.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reaction", { msgId, emoji });
    }
  });

  // ── DISCONNECT ─────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    // Updated online list sabko bhejo
    io.emit("onlineUsers", getOnlineUserIds());
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});