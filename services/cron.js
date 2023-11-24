const offerModel = require('../models/offerModel')
const cron = require('node-cron')
const productModel = require('../models/productModel');
const { default: mongoose } = require('mongoose');

const checkOffer = async () => {
    try {
        console.log('cron is running');
        const currentDate = new Date();

        const expiredOffer = await offerModel.find(
            {
                expiryDate: { $lte: currentDate }
            }
        )
        console.log(expiredOffer, 'expiredOffer');

        if (expiredOffer && expiredOffer.length > 0) {
            for (let offer of expiredOffer) {
                console.log(offer, 'offer');
                const categoryId = offer.categoryId;
                

                try {
                    await productModel.updateMany(
                        {
                            category: new mongoose.Types.ObjectId(categoryId)
                        },
                        {
                            $set: {
                                 isDiscountApplied: false,
                                discountAmount:0,
                                currentDiscountPercentage:0
                                }
                        }
                    )
                } catch (error) {
                    console.log(error);
                } 
                
            }
        }
        await offerModel.deleteMany(
            {
                expiryDate: { $lte: currentDate }
            }
        ).then(result => {
            console.log(result, 'delete');
        }).catch(err => {
            console.error('deleting doc', err)
        })
    } catch (error) {
        console.log(error);
    }

}
// cron.schedule('*/10 * * * * *',checkOffer);



