const router = require('express').Router();
const req = require('express/lib/request');
const ItemSchema = require("../models/itemmodel");
const userSchema = require("../models/usermodel");
const categorySchema = require("../models/categorymodel")
const {authVerify, isAdmin} = require("../middleware/auth");

router.post('/addCategory', isAdmin, async(req,res)=>{
    try{
        const data = new categorySchema(req.body);
        const result = await data.save()
        return res.status(200).json({status: "success", message: 'category added successfully', result: result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})
module.exports = router;
