const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    type: {
        type: String,
        enum:["follow","like", "comment", "message"],
        required: true
    },

    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },

    text: String,
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;