const router = require('express').Router();
const req = require('express/lib/request');
const ItemSchema = require("../models/itemmodel");
const userSchema = require("../models/usermodel");
const categorySchema = require("../models/categorymodel")
const {authVerify, isAdmin} = require("../middleware/Auth");

// add Item api for admin
router.post('/addItem', authVerify, async(req,res)=>{
    try{
        let detail = req.body
        const data = new ItemSchema(detail);
        const result = await data.save();
        return res.status(200).json({'status': 'success', "message": "Item details added successfully", "result": result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// get all Item api for user
router.get("/getAllItems", authVerify, async(req,res)=>{
    try{
        const ItemDetails = await ItemSchema.find().exec();
        if(ItemDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Item details fetched successfully", 'result': ItemDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Item details available"})
        }
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// get individual Item details
router.get("/getIndiItem", authVerify, async(req,res)=>{
    try {
        const ItemDetails = await ItemSchema.findOne({"uuid" : req.query.Item_uuid}).exec();
        if(ItemDetails){
            return res.status(200).json({'status': 'success', message: "Item details fetched successfully", 'result': ItemDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Item details available"})
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// update the Item details api call
router.put("/updateTheItem", authVerify, async(req,res)=>{
    try {
        let condition = {"uuid": req.body.uuid}
        let updateData = req.body.updateData;
        let option = {new: true}
        const data = await ItemSchema.findOneAndUpdate(condition, updateData, option).exec();
        return res.status(200).json({'status': 'success', message: "Item details updated successfully", 'result': data});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// delete Item details api call
router.delete("/deleteTheItemDetail/:Item_uuid", authVerify, async(req,res)=>{
    try {
        console.log(req.params.Item_uuid)
        await ItemSchema.findOneAndDelete({uuid: req.params.Item_uuid}).exec();
        return res.status(200).json({'status': 'success', message: "Item details deleted successfully"});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})

// get all Item api for based on the user
router.get("/getAllItemsBasedOnUser/:userUuid", authVerify, async(req,res)=>{
    try{
        const ItemDetails = await ItemSchema.find({userUuid: req.params.userUuid}).exec();

        // aggregate[]
        if(ItemDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Item details fetched successfully", 'result': ItemDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Item details available"})
        }
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// aggregate based
router.get("/categoriesBasedItem", async(req,res)=>{
    try {
    
        let itemDetails = await categorySchema.aggregate([
            {
                '$lookup':{
                    from:'items',
                    localField: 'uuid',
                    foreignField: 'categoryUuid',
                    as: 'item_details'
                }
            }
        ])

        
        if(itemDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': itemDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

router.get("/userBasedItem", async(req,res)=>{
    try {
        let itemDetails = await ItemSchema.aggregate([
            {
                "$lookup": {
                    from: "user",
                    localField: "userUuid", //primary table id()
                    foreignField: "uuid",
                    as: "user_data"
                }
            }
        ]).exec();
        // let itemDetails = await categorySchema.aggregate([
        //     {
        //         '$lookup':{
        //             from:'items',
        //             localField: 'uuid',
        //             foreignField: 'categoryUuid',
        //             as: 'item_details'
        //         }
        //     }
        // ])

        
        if(itemDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': itemDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});


// aggregate based
router.get("/userBasedItem2", async(req,res)=>{
    try {

        let ItemDetails = await categorySchema.aggregate([
            {
                $match:{
                    $and:[
                        {"uuid": req.query.category_uuid},
                        {"userUuid": req.query.userUuid},
                        {"ageRestriction": {$nin: [req.query.ageRestriction]}}
                    ]
                }
            },
            {
                '$lookup':{
                    from:'items',
                    localField: 'uuid',
                    foreignField: 'categoryUuid',
                    as: 'item_details'
                }
            },
            {
                "$lookup":{
                    from: 'user',
                    localField: 'userUuid',
                    foreignField: 'uuid',
                    as:'user_data'
                }
            },
            {
                '$unwind':{
                    path:'$item_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                '$unwind':{
                    path: '$user_data',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "_id": 0,
                    "categoryName": 1,
                    "item_details.itemName": 1,
                     "user_data.username":1

                }
            }         
        ])

        console.log(ItemDetails);
        if(ItemDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Item details fetched successfully", 'result': ItemDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Item details available"})
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});



module.exports = router;