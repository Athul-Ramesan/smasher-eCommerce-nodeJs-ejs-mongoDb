const joi = require('joi');


const userDetailsValidation = new joi.object({
    
    name: joi.string().trim().required(),
    mobile : joi.string().trim().length(10).pattern(/^[0-9]+$/).required()
})

module.exports = {
    userDetailsValidation
}