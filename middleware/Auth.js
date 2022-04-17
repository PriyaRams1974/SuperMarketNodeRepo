const { use } = require('bcrypt/promises');
const jwt = require('jsonwebtoken');

const userSchema = require('../models/usermodel');

function authVerify (req,res,next){
    try {
        console.log("verify token");
        let token = req.header("token")
        if(!token){
            return res.status(401).json({"status": "failure", "message": "Unauthorised access"})
        }
        const decode = jwt.verify(token, process.env.secrectKey)
        console.log(decode)
        next();
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: "Invalid token"})
    }    
}

function isAdmin(req,res,next){
    try{
        console.log("verify token1");
        let token = req.header("token")
        if(!token){
            return res.status(401).json({"status": "failure", "message": "Unauthorised access"})
        }
        const decode = jwt.verify(token, process.env.secrectKey)
        console.log(decode.uuid)
        console.log(decode)
        // let userdetails = await userSchema.findOne({uuid: decode.uuid}).exec()
        // console.log(userdetails)
        if(decode.role === "admin"){
            console.log("yes he is admin")
            next();
        }else{
            return res.status(401).json({"status": "failure", "message": "Unauthorised access"})
        }       
    }catch(error){
        console.log(error.message)
        return res.status(500).json({status: "failure", message: "Invalid token"})
    }
}

module.exports = {
    authVerify: authVerify,
    isAdmin: isAdmin
}