const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require('../models/userModel')
const fetchAndSaveGithubData = require("../services/githubService");
const repoModel = require("../models/repoModel");
const notificationModel = require("../models/notificationModel");
const blacklistModel = require("../models/blacklistToken");
const registerUser = async(req,res) =>{
    try {
        const {name, email, password, githubUsername} = req.body;
        const isAlreadyExist = await userModel.findOne({email});
        if(isAlreadyExist){
            return res.status(400).json({ success: false, message: "userAlreadyExist Please login"})
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await userModel.create({
            name,
            email,
            password:hashedPassword,
            githubUsername
        })
          // Auto GitHub Fetch
        await fetchAndSaveGithubData(user);
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'})

        res.status(200).json({ success: true, message:"User Registered Successfully", user})
    } catch (error) {
        res.status(401).json({success:false, message:error.message})
    }

}

const loginUser = async(req,res) =>{
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).json({ success: false, message:'Something Went Wrong'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success: false, message:"Something Went Wrong"})
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET, {expiresIn:'1d'})

        res.status(200).json({success: true, message:"Login Successfully", user, token})

    } catch (error) {
        res.status(401).json({success: false, message:error.message})
        
    }

}

const userProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const repos = await repoModel.find({ user: user._id });

    // ✅ repos ko user object ke saath bhejo
    const userObj = user.toObject();
    userObj.githubRepos = repos;  // ← ye ek line add karo

    res.status(200).json({
      success: true,
      user: userObj,
      repos  // optional — rakh sakte ho
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async(req,res) => {
    try {
        const token =  req.headers.authorization?.split(" ")[1];
        await blacklistModel.create({
            token
        })
        res.status(200).json({
            success: true,
            message:"Logout Successfully"
        })
    } catch (error) {
        res.status(401).json({
            success:false,
            message: error.message
        })
        
    }
    
}


const updateProfile = async (req,res) =>{
    try {
        const {name, bio, skills, website, location, githubUsername} = req.body;

        const user = await userModel.findById(req.user.id);

        if(!user){
            return res.status(400).json({
                success: false,
                message: 'User not Found'
            })
        }

        if(name) user.name = name;
        if(bio) user.bio = bio;
        if(website) user.website = website;
        if(location) user.location = location;
        if(skills) {
            user.skills = skills
        }
        
        //Github Username Change 
        let githubChanged = false;

        if(githubUsername && githubUsername !== user.githubUsername){
            user.githubUsername = githubUsername;
            githubChanged = true;
        }

        await user.save();

        // Refresh Github Data 

        if(githubChanged){
            await fetchAndSaveGithubData(user)
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile Updated Successfully',
            user
        })
    } catch (error) {

        res.status(401).json({
            success:true,
            message: error.message
        })
        
    }
    

}

const exploreDevelopers = async (req,res) => {
    try {
        const search = req.query.search || "";
        const skill = req.query.skill || "";

        let query ={};

        // Search By Name

        if(search){
            query.name = {
                $regex: search,
                $options: "i"
            }
        }

        // Filter By Skill

        if(skill){
            query.skills = {
                $elemMatch:{
                    $regex: skill,
                    $options:"i"
                }
            }
        }

        // Fetch User 
        const users = await userModel.find(query).select("-password").sort({createdAt: -1});

        res.status(200).json({
            success: true,
            total: users.length,
            users
        })

    } catch (error) {
        res.status(401).json({
            success: true,
            message: error.message
        })
        
    }
}

const followUser = async (req, res) => {
  try {

    const currentUser = await userModel.findById(
      req.user.id
    );

    const targetUser = await userModel.findById(
      req.params.id
    );

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


    // SELF FOLLOW CHECK
    if (
      currentUser._id.equals(targetUser._id)
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }


    // CHECK FOLLOWING
    const alreadyFollowing =
      currentUser.following.some(id =>
        id.equals(targetUser._id)
      );


    // =========================
    // UNFOLLOW
    // =========================

    if (alreadyFollowing) {

      currentUser.following =
        currentUser.following.filter(
          id => !id.equals(targetUser._id)
        );

      targetUser.followers =
        targetUser.followers.filter(
          id => !id.equals(currentUser._id)
        );

      await currentUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        following: false,
        message: "User unfollowed"
      });

    }


    // =========================
    // FOLLOW
    // =========================

    currentUser.following.push(
      targetUser._id
    );

    targetUser.followers.push(
      currentUser._id
    );

    

    await currentUser.save();
    await targetUser.save();
    // Notification
    await notificationModel.create({
    sender: currentUser._id,
    receiver: targetUser._id,
    type: "follow",
    text: `${currentUser.name} followed you`
    });

    res.status(200).json({
      success: true,
      following: true,
      message: "User followed"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Kisi bhi user ki public profile fetch karo by ID
const getUserById = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password')  // password mat bhejo

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}



module.exports = {registerUser, loginUser, userProfile, updateProfile, exploreDevelopers , followUser, logout, getUserById }