const joi = require('joi');

addCoupon = new joi.object({
    couponName : joi.string().uppercase().trim().required(),
    couponCode : joi.string().trim().uppercase().length(6).required(),
    discountAmount : joi.number().min(0).min(0).required(),
    maxUseCount : joi.number().required(),
    minimumOrderAmount : joi.number().min(0).required(),
    maximumDiscountAmount : joi.number().min(0).required(),
    expiryDate : joi.date().min(new Date()).required().messages({
        'date.min' : 'Please select a future date'
    })

})

module.exports = addCoupon