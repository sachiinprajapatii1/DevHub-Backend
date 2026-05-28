const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    content:{
        type: String,
        required: true,
        trim: true
    },
    likes:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"User"
            }
        }
    ],
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            text:{
                type:String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now

            }
        }
    ]
},{ timestamps: true})

const postModel = mongoose.model("Post", postSchema);

module.exports = postModel;