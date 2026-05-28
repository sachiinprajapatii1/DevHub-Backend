const postModel = require('../models/postModel');
const notificationModel = require("../models/notificationModel")



const createPost = async(req,res) =>{
    try {
        const {content} = req.body;
        if(!content){
            return res.status(400).json({
                success: false,
                message:"Content Is Required"
            });
        }
        const post = await postModel.create({
            user: req.user.id,
            content
        })

        res.status(200).json({
            success: true,
            message: "Post Created",
            post
        });
    } catch (error) {
        res.status(401).json({
            success:false,
            message:error.message
        })
        
    }

}

const getAllPost = async(req,res) => {
    try {
        const posts = await postModel.find().populate("user", "name avatar githubUsername").populate("comments.user","name avatar").sort({createdAt: -1});
        res.status(200).json({
            success:true,
            total: posts.length,
            posts
        })
    } catch (error) {
        res.status(401).json({
            success:false,
            message: error.message
        })
    }
}

// Like/Unlike Posts

const likePost = async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ success: false, message: "Post Not Found" });
    }

    const alreadyLiked = post.likes.some(id => id.equals(req.user.id));

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => !id.equals(req.user.id));
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post Unliked",
        post: { likes: post.likes }  // ← frontend ke liye
      });
    }

    // Like
    post.likes.push(req.user.id);
    await post.save();

    // Notification — sirf like pe, unlike pe nahi
    await notificationModel.create({
      sender:   req.user.id,
      receiver: post.user,
      type:     "like",
      post:     post._id,
      text:     "Someone liked your post"
    });

    return res.status(200).json({
      success: true,
      message: "Post Liked",
      post: { likes: post.likes }  // ← frontend ke liye
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// comment on post

const commentPost = async(req,res) =>{
    try {
        const {text} = req.body;
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(400).json({
                success: true,
                message:"Post Not Found"
            })
        }
        post.comments.push({
            user: req.user.id,
            text
        })

        await post.save();

        // Notification
        await notificationModel.create({
        sender: req.user.id,
        receiver: post.user,
        type: "comment",
        post: post._id,
        text: "Someone commented on your post"

});
        
        res.status(200).json({
            success: true,
            message:"Comment Added",
            
        })

    } catch (error) {
        res.status(401).json({
            success:true,
            message: error.message
        })
        
    }
}


// Delete Post 

const deletePost = async (req,res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            res.status(400).json({
                success: true,
                message: "Post not Found"
            })
            
        }

        // Only Owner Can Delete Post 

        if(!post.user.equals(req.user.id)){
            res.status(403).json({
                success:false,
                message:"UnAuthorized"
            })
        }
        await post.deleteOne();
        res.status(200).json({
            success:false,
            message: "Post Deleted"
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message: error.message
        })
        
    }
}

module.exports = {createPost, getAllPost, likePost, commentPost, deletePost};