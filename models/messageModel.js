// models/messageModel.js
const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  name: { type: String },
  url:  { type: String, required: true },
  size: { type: Number },
  type: { type: String },
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const messageModel = mongoose.model("messages", messageSchema);
module.exports = messageModel;