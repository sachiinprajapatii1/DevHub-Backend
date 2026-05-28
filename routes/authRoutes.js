const express = require("express");
const router = express.Router();
const Protect = require("../middlewares/authmiddleware")
const {loginUser, registerUser, userProfile, updateProfile, exploreDevelopers, followUser, logout, getUserById} = require("../controllers/authController");
const protect = require("../middlewares/authmiddleware");

router.post("/",loginUser);
router.post("/register",registerUser)
router.get("/profile",protect ,userProfile)
router.get("/logout",protect, logout)
router.post('/profile',protect, updateProfile)
router.get('/explore',exploreDevelopers)
router.put("/follow/:id", protect, followUser)


// Baaki routes same rahenge, sirf yeh ek line add karo:
router.get('/user/:id', protect, getUserById)  // ✅ naya route

module.exports = router;