const express = require("express");
const { getNotification, marksAsRead } = require("../controllers/notificationController");
const protect = require("../middlewares/authmiddleware");

const router = express.Router();

router.get("/",protect,getNotification);
router.put("/:id",protect,marksAsRead)


module.exports = router;