// controllers/chatController.js
const messageModel = require("../models/messageModel");

// ── Send Message ──────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, attachments } = req.body;

    // text ya attachments — koi ek toh hona chahiye
    if (!text?.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: "Message is empty" });
    }

    const message = await messageModel.create({
      sender: req.user.id,
      receiver: receiverId,
      text: text?.trim() || "",
      attachments: attachments || [],
    });

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Messages ──────────────────────────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.id; // ← :id from route

    const messages = await messageModel
      .find({
        $or: [
          { sender: req.user.id, receiver: otherUserId },
          { sender: otherUserId, receiver: req.user.id },
        ],
      })
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendMessage, getMessages };