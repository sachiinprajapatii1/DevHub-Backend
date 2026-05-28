const notificationModel = require("../models/notificationModel");


const getNotification = async(req,res) =>{
    try {
        const notifications = await notificationModel.find({receiver: req.user.id}).populate("sender", "name githubUsername").sort({createdAt: -1})
        res.status(200).json({
            success:true,
            notifications
        })
    } catch (error) {
        res.status(401).json({
            success:true,
            message: error.message
        })
        
    }

}

const marksAsRead = async(req,res) => {
    try {
        await notificationModel.findByIdAndUpdate(req.params.id, {read:true})
        res.status(200).json({
            success:true,
            message:"Notification marked as read"
        })
    } catch (error) {

        res.status(401).json({
            success: true,
            message: error.message
        })
        
    }

}

module.exports = {getNotification, marksAsRead}