const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String,
        default: ''
    },
    skills: [
        {
            type: String
        }
    ],
    githubUsername: {
        type: String,
        required: true
    },
    totalStars: {
        type: Number,
        default: 0
    },
    languages: [
        {
            type: String
        }
    ],
    avatar: String,
    website: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        default: ""
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],


}, { timestamps: true })

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;