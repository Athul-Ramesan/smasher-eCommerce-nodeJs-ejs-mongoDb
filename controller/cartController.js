const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel');
const stockService = require('../services/stockService')

const cartService = require('../services/cartService');
const couponModel = require('../models/couponModel');

module.exports = {
    getAddToCart: async (req, res) => {
        try {
            const productId = req.params.id;
            const stock = await stockService.checkProductStock(productId)

            console.log(stock, 'stock');
            if (stock > 0) {
                const user = await userModel.findOne({ email: req.session.user.email });
                console.log('user', user);
                let userCart = await cartModel.findOne({ userId: user._id })

                if (!userCart) {

                    console.log('no user cart');
                    userCart = await cartModel.create({
                        userId: user._id,
                        items: [{
                            productId: productId,
                            quantity: 1
                        }]
                    })
                    const cartCount = userCart.items.length
                    console.log(cartCount, 'cartCount');

                    res.json({ success: true, cartCount })

                } else {
                    const existingCart = userCart.items.find(item => item.productId.equals(productId))

                    console.log('inside else');
                    if (existingCart) {

                        console.log(' existingCart', existingCart);
                        existingCart.quantity += 1
                        console.log(userCart);

                    } else {
                        userCart.items.push({ productId: productId, quantity: 1 })
                    }
                    console.log('userCart', userCart);
                    await cartModel.findOneAndUpdate({ userId: user._id }, userCart)
                    const cartCount = userCart.items.length
                    console.log(cartCount, 'cartCount');

                    res.json({ success: true, cartCount })
                }
            } else {
                res.json({ success: false, error: 'Sorry, product out of stock' })
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, error: 'error adding to cart' })
        }



    },
    getCart: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.user.email })

            await cartService.calculateCartTotal(req.session.user._id)
            const cart = await cartModel.findOne({ userId: user._id }).populate('items.productId')
            const coupons = await couponModel.find({})
            const products = await productModel.find({})
            // console.log(cart);
            // if(cart.items){
            //     cart.items.forEach(item=>{
            //         if(item.productId.stock ===0 || item.productId.stock <item.quantity){
            //          req.flash('outOfStock','Cant make purchase with out of stock product')
            //          return res.redirect('/cart')
            //         }
            //      })
            // }
            // if(cart.items<=0){
            //     await cartService.removeCoupon(user._id )
            //     .then(result=>{
            //         console.log(result);
            //     })
            // }
            res.render('user/cart', {
                user,
                products,
                cart,
                wishlist: false,
                message: req.flash(),
                coupons
            })

        } catch (error) {
            console.log(error);

        }
    },


    postUpdateCartQuantity: async (req, res) => {
        try {
            const productId = req.body.productId;



            const netChange = req.body.quantity;

            const cart = await cartModel.findOne({ userId: req.session.user._id })
                .populate('couponId')

            if (!cart) {
                throw new Error('cart not found')
            }
            const itemToUpdate = await cart.items.find(item => item.productId.equals(productId))

            const quantity = itemToUpdate.quantity

            const newQuantity = quantity + parseInt(netChange)
            itemToUpdate.quantity = newQuantity;
            await cart.save()

            const { totalAmount, totalDiscount } = await cartService.calculateCartTotal(req.session.user._id)

            const couponDiscountAmount = cart.isCouponApplied ? cart.couponId.discountAmount : 0
            const minimumOrderAmount = cart.isCouponApplied ? cart.couponId.minimumOrderAmount : 0
            
            if (totalAmount < minimumOrderAmount) {
                await cartService.removeCouponFromCart(cart._id)
                    .then(result => {
                        console.log(result, 'resultr after coupon rmvl frm cart quantity update');
                    })
            } else if (cart.couponId) {

                await cartModel.findOneAndUpdate(
                    { userId: req.session.user._id },
                    {
                        isCouponApplied: true,
                        couponDiscountAmount: couponDiscountAmount
                    }
                )
            }
            const cartAfterUpdate = await cartModel.findOne({userId: req.session.user._id})
            .populate('couponId')
           
            console.log(cartAfterUpdate,'cartafterupdateklllllllllllllllllllllllllllllllllll');
            const couponDiscountAmountAfterInc = cartAfterUpdate.isCouponApplied ? cartAfterUpdate.couponId.discountAmount : 0

            
            const isCouponApplied =  cartAfterUpdate.isCouponApplied
            const couponId = cartAfterUpdate.couponId ? cartAfterUpdate.couponId : null

            console.log(couponId);
            const product = await productModel.findById(productId)
            console.log(product, 'product');
            const stock = product.stock;
            res.json({
                success: true,
                newQuantity,
                totalAmount,
                stock,
                totalDiscount,
                isCouponApplied,
                couponDiscountAmountAfterInc,
                couponId

            })
        } catch (error) {
            throw error;
        }
    },
    getRemoveFromCart: async (req, res) => {
        const productId = req.params.id;
        try {

            await cartModel.findOneAndUpdate(
                { userId: req.session.user._id },
                {
                    $pull: {
                        items: {
                            productId: productId
                        }
                    }
                },
                { new: true }
            ).then(async () => {
                await cartService.removeCoupon(req.session.user._id)
                    .then(result => {
                        console.log(result);
                    })
                res.redirect('/cart')
            }).catch((error) => {
                console.log(error);
            })
        } catch (error) {
            console.log(error);
        }


    },
    applyCoupon: async (req, res) => {
        const body = req.body
        const userId = req.session.user._id;
        console.log(body, 'body');
        cartService.applyCoupon(body.coupon, userId)
            .then(async (result) => {

                // const cartData = await cartModel.
                console.log(result, 'result inside then before response');
                res.json({ ...result, success: true })
            }).catch((err) => {
                console.log(err);
                console.log(err.message, 'err inside catch before response');
                res.json(err.message)
            })
    },
    removeCoupon: async (req, res) => {
        try {
            const userId = req.session.user._id;
            await cartService.removeCoupon(userId)
                .then(result => {
                    res.json({ ...result, success: true })
                })

        } catch (error) {
            console.error(error.message, 'error in catch');
            res.json(error.message)

        }
    }
}