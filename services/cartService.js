const mongoose = require('mongoose');

const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const couponModel = require('../models/couponModel')


module.exports = {

    calculateCartTotal: async (userId) => {
        try {
            const cart = await cartModel.findOne({ userId: userId })

            await cartModel.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $unwind: '$items'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $set: {
                        'items.productSubtotal': { $multiply: ['$items.quantity', '$product.price'] },
                        'items.discountSubtotal': { $cond: [{ $eq: ['$product.isDiscountApplied', true] }, { $multiply: ['$items.quantity', '$product.discountAmount'] }, 0] }
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        totalAmount: { $sum: '$items.productSubtotal' },
                        totalDiscount: { $sum: '$items.discountSubtotal' }
                    }
                }
            ]).then(cartSummary => {
                console.log(cartSummary, 'this is result');
                if (cartSummary.length > 0) {
                    totalAmount = cartSummary[0].totalAmount
                    totalDiscount = cartSummary[0].totalDiscount
                } else {
                    totalAmount = 0;
                    totalDiscount = 0;
                }
                cart.totalAmount = totalAmount
                cart.totalDiscount = totalDiscount

            }).catch(err => {
                console.log(err);
            })


            await cart.save()
            return { totalAmount, totalDiscount }
        } catch (error) {
            console.log(error);
        }

    },
    getCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await cartModel.findOne({ userId: userId })
                    .populate("items.productId")
                    .populate('coupon')

                if (!cart) {
                    const error = new Error('Cart not available for this user')
                    error.status = 400;
                    reject(error)
                }
            } catch (error) {

            }
        })
    },
    applyCoupon: async (couponCode, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('inside apply coupon');
                const coupon = await couponModel.findOne({ couponCode: couponCode })
                if (!coupon) {
                    console.log('inside cannot find coupon');
                    const error = new Error('Cannot find coupon!!')
                    error.status = 404;
                    reject(error)
                }
                if (!coupon.active) {
                    console.log('inside not active coupon');
                    const error = new Error('Coupon not active, Try another coupon !!')
                    error.status = 400;
                    reject(error)
                }
                let cart = await cartModel.findOne({ userId: userId })
                    .populate("items.productId")
                    .populate('couponId')
                console.log('this is cart inside apply coupon', cart);
                if (!cart) {
                    console.log('inside no cart');
                    const error = new Error('Cart not available for this user')
                    error.status = 400;
                    reject(error)
                } else {
                    console.log('inside apply coupon else');
                    const couponId = coupon._id
                    const cartTotal = cart.totalAmount
                    const offerDiscountAmount = cart.totalDiscount;
                    const totalAmountBeforeCouponApply = cartTotal - offerDiscountAmount;
                    await module.exports.couponValidationForApplyCoupon(coupon, cart, totalAmountBeforeCouponApply)
                        .then(async (result1) => {

                            console.log(result1, 'result1 from couponvlaidation for apply coupon');
                            console.log('inside then of cooupon vlidation, we can assign coupon');
                            const result = await cartModel.findOneAndUpdate(
                                { userId: userId },
                                {
                                    couponId: couponId,
                                    isCouponApplied: true,
                                    couponDiscountAmount: result1.couponDiscountAmount
                                }, { new: true }
                            )
                            console.log(result, 'cart after updation');
                            if (!result) {
                                const error = new Error("Cannot apply coupon. Try again...");
                                error.status = 400;
                                reject(error)
                            } else {
                                resolve(result)
                            }
                        })
                        .catch((err) => {
                            const error = new Error(err);
                            error.status = 400;
                            reject(error)
                        })
                }
            } catch (error) {
                error.status = 500;
                reject(error)
            }
        })

    },
    couponValidationForApplyCoupon: async (coupon, cart, totalAmountBeforeCouponApply) => {
        console.log({
            coupon: coupon,
            cart: cart,
            totalAmountBeforeCouponApply: totalAmountBeforeCouponApply
        });
        return new Promise(async (resolve, reject) => {
            console.log('inside couponValidationForApplyCoupon');
            //  let couponDiscountPrice =0;
            let totalCartAmountAfterCoupon = 0
            const minimumOrderAmountForCouponApply = Number(coupon?.minimumOrderAmount);
            const couponDiscountAmount = Number(coupon?.discountAmount);
            const maximumDiscountableAmount = Number(coupon?.maximumDiscountableAmount);
            let currentDate = new Date();
            let couponApplied = false;
            if (!coupon.active) {
                await module.exports.removeCouponFromCart(cart._id)
                return reject('Invalid coupon. Coupon removed')
            } else if (totalAmountBeforeCouponApply < minimumOrderAmountForCouponApply) {
                await module.exports.removeCouponFromCart(cart._id)
                return reject("Cart total is less than coupon minimum required amount. Coupon removed");
            } else if (currentDate > new Date(coupon.expiryDate)) {
                await module.exports.removeCouponFromCart(cart._id)
                return reject('Coupon is expired. Coupon removed')
            } else {
                await module.exports.couponPerUserCountCheck(cart.userId, coupon.couponCode)
                    .then(() => {
                        totalCartAmountAfterCoupon = parseInt(totalAmountBeforeCouponApply - couponDiscountAmount)
                        couponApplied = true

                    }).catch((error) => {
                        return reject(error)
                    })
            }

            resolve({ couponApplied, totalCartAmountAfterCoupon, couponDiscountAmount })
        })
    },
    removeCouponFromCart: async (cartId) => {
        try {
            console.log('inside remove coupon fromcart');
            await cartModel.findOneAndUpdate({
                _id: cartId
            },
                {
                    isCouponApplied: false,
                    couponDiscountAmount: 0
                })
        } catch (error) {
            throw error
        }
    },
    couponPerUserCountCheck: async (userId, couponCode) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('inside couponPerUserCountCheck');
                const coupon = await couponModel.findOne({ couponCode: couponCode }).select("users maxUseCount")
                console.log(coupon.users, coupon.maxUseCount, 'maxUseCount users and max use count');
                coupon.users.map(item => {
                    if (String(item.userId) === String(userId)) {
                        if (item.usedCount >= coupon.maxUseCount) {
                            reject("User has reach the maximum usage of this coupon")
                        }
                    }
                })
                resolve("User is eligible for this coupon")
            } catch (error) {
                console.log(error.message)
                reject(error.message)
            }
        })
    },
    removeCoupon: async (userId) => {
        try {
            
            return new Promise(async (resolve,reject)=>{
                console.log('inside remove coupon fromcart');
                await cartModel.findOneAndUpdate(
                    {
                        userId: userId
                    },
                    {
                        isCouponApplied: false,
                        couponDiscountAmount: 0
                    },
                    {
                        new: true
                    })
                    .then((result) => {
                        console.log(result, 'result inside coupon removed from cart');
                        resolve(result)
                    }).catch((err)=>{
                        reject(err)
                    })
            })
            

        } catch (error) {
            throw error
        }
    }

    // from here we want to start
}
