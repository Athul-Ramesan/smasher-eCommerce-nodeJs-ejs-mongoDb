const offerModel = require("../models/offerModel")
const moment = require('moment')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const { default: mongoose } = require("mongoose")
const productService = require('../services/productService')



module.exports = {

    getAdminOffer: async (req, res) => {

        try {
            const products = await productModel.find({})
            const categories = await categoryModel.find({})
            const productOffers = await offerModel.find({ type: 'product' })
                .populate('productId')

            // console.log(productOffers,'productOffers');

            const formatedProductOffers = productOffers.map(doc => ({

                ...doc.toObject(),
                expiryDate: moment(doc.expiryDate).format('MMMM Do YYYY'),

            }))
            // console.log(formatedProductOffers, 'formatedProductOffers');

            const categoryOffers = await offerModel.find({ type: 'category' })
                .populate('categoryId')
            const formatedCategoryOffers = categoryOffers.map(doc => ({

                ...doc.toObject(),
                expiryDate: moment(doc.expiryDate).format('MMMM Do YYYY'),

            }))
            // console.log(formatedCategoryOffers, 'formatedCategoryOffers');
            res.render('admin/offers', {
                productOffers: formatedProductOffers,
                categoryOffers: formatedCategoryOffers,
                products: products,
                categories: categories
            })

        } catch (error) {
            console.log(error);
        }

    },
    addProductOffer: async (req, res) => {

        const { discountAmount, productId, expiryDate } = req.body

        try {
            await offerModel.create({
                productId: new mongoose.Types.ObjectId(productId),
                type: 'product',
                discountAmount: discountAmount,
                expiryDate: expiryDate
            }).then(result => {
                console.log(result);
                res.json({ success: true, offerData: result, message: 'Offer added successfully' })
            }).catch(err => {
                console.log(err);
                res.json({ success: false, message: 'failed to add coupon' })
            })
        } catch (error) {
            console.log(error);
        }
    },
    addCategoryOffer: async (req, res) => {

        try {
            const { categoryId, discountPercentage, expiryDate } = req.body;

            const discountMultiplier = discountPercentage / 100

           
            await offerModel.create({
                categoryId: new mongoose.Types.ObjectId(categoryId),
                type: 'category',
                discountPercentage: discountPercentage,
                expiryDate: expiryDate
            }).then(async (result) => {
                console.log(result);

                await productModel.updateMany(
                    {
                        category: new mongoose.Types.ObjectId(categoryId)
                    },
                    [
                        {
                            $set: {
                                currentDiscountPercentage: discountPercentage,
                                discountAmount: {
                                    $multiply: ['$price', discountMultiplier]
                                },
                                isDiscountApplied: true
                            }
                        }
                    ]
                )
                    .then(result => {
                        console.log(result, 'product model');
                    }).catch(error => {
                        console.log(error);
                        // return res.json({ success: false, message: 'failed to add coupon' })

                    })

                res.json({ success: true, offerData: result, message: "Offer added successfully" })
            }).catch(err => {
                console.log(err);

                if (err.code == '11000') {
                    res.json({ success: false, message: 'Offer on this category is already added' })
                } else {
                    console.log(err);
                    return res.json({ success: false, message: 'failed to add coupon' })
                }
            })
        } catch (error) {
            console.log(error);

        }

    },
    removeOffer: async (req, res) => {
        console.log(req.params, 'params');
        const offerId = req.params.id;

        // try {
        //     console.log(req.params, 'params');
        //     console.log(req.url);
        //     if (req.url === `/removeProductOffer/${offerId}`){
        //         console.log('hoiii');
        //         await offerModel.findOneAndDelete({ _id: offerId })
        //             .then(result => {
        //                 console.log('inside product offer');
        //                 console.log(result);
        //                 res.redirect('/admin/offers')
        //             })
        //     }
             
        // } catch (error) {
        //     console.log(error);
        // }
        try {

            if (req.url === `/removeCategoryOffer/${offerId}`) {

             
                const offer = await offerModel.findOne({ _id: offerId })
                console.log(offer,'offerrrrrrr');
                const categoryId = offer.categoryId

                await offerModel.findOneAndDelete({ _id: offerId })
                    .then(async (result) => {
                        
                        console.log(result);
                        await productModel.updateMany(
                            {
                                category: new mongoose.Types.ObjectId(categoryId)
                            },
                            {
                                $set: { 
                                    isDiscountApplied: false ,
                                    discountAmount: 0,
                                    currentDiscountPercentage:0
                                }
                            }
                        ).then(result => {
                            console.log(result);
                            res.redirect('/admin/offers')
                        }).catch(err => {
                            console.log(err);
                        })

                    })
            }

        } catch (error) {
            console.error(error);
        }

    }

}