const productModel = require("../models/productModel");


module.exports= {
    checkProductStock : async(productId)=>{
        try {
            return new Promise(async(resolve, reject)=>{
                await productModel.findOne({_id: productId})
                .then(result=>{
                    resolve(result.stock)
                })
                .catch(error=>[
                    reject(error)
                ])
            })
        } catch (error) {
            console.log(error);
        }
    }
}