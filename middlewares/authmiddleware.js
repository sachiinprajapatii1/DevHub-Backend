const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklistToken")


const protect = async(req,res,next) =>{
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if(!token){
            return res.status(400).json({success:false,message:"Invalid Token"})
        }
       
        const isBlacklistToken = await blacklistModel.findOne({token});
        if(isBlacklistToken){
            return res.status(400).json({
                success:false,
                message:"UnAuthorized"
            })
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({success:false, message: error.message})
        
    }
    
}

module.exports = protect;