const express = require("express")
const router = express.Router();
const protect = require("../middlewares/authmiddleware")
const { getAllPost, createPost, likePost, commentPost, deletePost,  } = require("../controllers/postController")

router.post("/",protect, createPost )
router.get("/", getAllPost);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect,commentPost);
router.delete("/:id",protect,deletePost)


module.exports = router
