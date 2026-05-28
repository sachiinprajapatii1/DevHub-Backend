const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    token:{
        type: String,
        required:true,
        unique:true
    },
    createdAt:{
        type: Date,
        default:Date.now ,
        expiresIn: "86400"  // 1d in Seconds
     }
})

const blacklistModel = mongoose.model("Blacklis", blacklistSchema);

module.exports = blacklistModel