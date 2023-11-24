const productModel = require('../models/productModel')

module.exports ={
    calculateProductDiscount : (basePrice, discountPercentage)=>{
        return new Promise((resolve,reject)=>{
            const discountAmount = basePrice*discountPercentage/100;
            const priceAfterDiscount = basePrice*(100-discountPercentage)/100;

            resolve(discountAmount,priceAfterDiscount)
            reject(error=>{
                console.log(error);
            })
        })
    }
}