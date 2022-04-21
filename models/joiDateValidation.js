const joi = require("joi");

const DateSchema = joi.object({
     fromDate: joi.date().less(joi.ref('toDate')).required(),
     toDate: joi.date().less('now').required()
});

const ExpireDateSchema = joi.object({
    fromDate: joi.date().less(joi.ref('toDate')).required(),
    toDate: joi.date().equal('now').required()
});

module.exports={
    DateSchema:DateSchema
}