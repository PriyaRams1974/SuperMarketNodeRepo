const mongoose = require('mongoose');
const crypto = require('crypto');

const itemSchema = new mongoose.Schema({
    uuid: {type: String, required:false},
    itemName:{type: String, required: true, trim: true},
    quantity:{type: Number, required: true},
    price:{type: String, required: true},
    brand:{type: String, required: true},
    incredients: {type: String, required: false},
    expireDate:{type: String, required: true, trim: true},
    itemImage: {type: String, required: true},
    inStock: {type: Boolean, required: false, default: true},
    userUuid: {type: String, required: true},//user relation
    categoryUuid:{type: String, required: true}//category relation
},
{
    timestamps: true
});

// UUID generation
itemSchema.pre('save', function(next){
    this.uuid = 'ITEM-'+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});

module.exports=mongoose.model('item',itemSchema);