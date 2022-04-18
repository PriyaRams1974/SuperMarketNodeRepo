// Joi schema Validations
const joi=require('joi')
const { schema } = require('./usermodel')

const authSchema=joi.object({
    username: joi.string().alphanum().pattern(new RegExp('.*[0-9].*')).required(),
    // firstName: joi.string().min(3).max(30).required(),
    // lastName:joi.string().min(3).max(30).required(),
    password:joi.string().min(6).max(10).alphanum().required(),
    mobileNumber:joi.number().integer().max(10).required(),
    gender:joi.string().min(6).max(10).required(),
    userUuid:joi.string().required(),
    DOB:joi.string().alphanum().required(),   
})
module.exports={
    authSchema:authSchema
}