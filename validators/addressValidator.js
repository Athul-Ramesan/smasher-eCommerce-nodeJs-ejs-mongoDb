const joi = require('joi')


const addAddress = new joi.object({
    name: joi.string().trim().required(),
    mobile : joi.string().trim().length(10).pattern(/^[0-9]+$/).required(),
    houseName: joi.string().trim().required(),
    locality: joi.string().trim().required(),
    district: joi.string().trim().required(),
    pincode: joi.string().trim().pattern(/^[0-9]+$/).length(6).required(),
    state: joi.string().trim().required()
}) 


 
module.exports= {
    addAddress
}