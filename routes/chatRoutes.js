const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatController");
const protect = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/send",protect,sendMessage);
router.get("/:id",protect, getMessages);


module.exports = router;