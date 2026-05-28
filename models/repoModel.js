const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required: true
    },
    repoName: {
        type: String,
        required: true
    },
    description:{
        type: String,
        default:""
    },
    stars:{
        type: Number,
        default:0
    },
    forks:{
        type: Number,
        default: 0
    },
    language:{
        type: Array,
        default: 'Unknown'
    },
    repoUrl:{
        type: String,
        unique: true
    },
    githubRepoId:{
        type: Number,
        unique: true
    }
})

const repoModel = mongoose.model("Repo",repoSchema);

module.exports = repoModel;