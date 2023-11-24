const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel');
const { default: mongoose } = require('mongoose');
const moment = require('moment')
const crypto = require('crypto');
const invoiceService = require('../services/invoice');


const orderService = require('../services/orderService');
const path = require('path');



module.exports = {
    getAdminOrders: async (req, res) => {
        const itemsPerPage = 10;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            totalItems = await orderModel.countDocuments();
            const totalPages = Math.ceil(totalItems / itemsPerPage)

            const orders = await orderModel
                .find()
                .skip(skip)
                .limit(itemsPerPage)

            const formatedOrders = orders.map(doc => ({
                ...doc.toObject(),
                orderedDate: moment(doc.orderedDate).format('MMMM Do YYYY, h:mm:ss a'),
                expectedDeliveryDate: moment(doc.expectedDeliveryDate).format('MMMM Do YYYY')
            }))

            console.log(formatedOrders);
            res.render('admin/orders', {
                orders: formatedOrders,
                currentPage,
                totalPages
            })
        } catch (error) {
            console.log(error);
        }
    },
    getAdminOrderDetails: async (req, res) => {
        const orderId = req.params.id;
        try {
            const order = await orderModel.findOne({ _id: orderId }).populate('items.productId')
            res.render('admin/orderDetails', { order })
        } catch (error) {

        }
    },
    putAdminUpdateOrderStatus: async (req, res) => {
        console.log(req.query);
        const { id, status } = req.query;
        // const orderId = req.body.orderId;
        // const newStatus = req.body.newStatus;

        try {
            if (id && status) {

                if (status === "Delivered") {
                    await orderModel.updateOne({ _id: id }, { $set: { status: status, paymentStatus: 'Paid', deliveredDate: new Date() } })

                    res.json({ success: true, paymentStatus: 'Paid' })
                } else {
                    await orderModel.updateOne({ _id: id }, { $set: { status: status, paymentStatus: 'Pending' } })
                    res.json({ success: true, paymentStatus: 'Pending' })
                }

            } else {
                res.json({ success: false })
            }
        } catch (error) {
            console.log(error);
        }
    },
    getAdminOrderReturnRequest: async (req, res) => {

        try {
            const orders = await orderModel.find({ status: 'Return requested' }).populate('items.productId')
            res.render('admin/return-request', { orders, dates: null })
        } catch (error) {
            console.log(error);
        }
    },
    checkout: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id }).populate('items.productId')
            const addresses = await addressModel.findOne({ userId: userId })

            if (cart.items) {
                cart.items.forEach(item => {
                    if (item.productId.stock === 0 || item.productId.stock < item.quantity) {
                        req.flash('outOfStock', 'Cant make purchase with out of stock product')
                        console.log('inside cart item outof stock');
                        return res.redirect('/cart')
                    }
                })
            }
            if (cart.items === 0 || !cart) {
                console.log('inside cart items kaali');
                return res.redirect('/cart')
            }


            if (cart) {
                res.render('user/checkout', {
                    user,
                    cart,
                    wishlist: false,
                    addresses,
                    message: req.flash()
                })
            } else {
                req.flash('cartEmpty', 'Cant make purchase with out of stock product')
                res.redirect('/cart')
            }


        } catch (error) {
            console.log(error);

        }
    },

    postCheckout: async (req, res) => {

        try {
            console.log(req.body);
            const addressId = req.body.address;
            const userId = new mongoose.Types.ObjectId(req.session.user._id)
            const paymentMethod = req.body.paymentMethod;
            const cart = await cartModel.findOne({ userId: userId }).populate('items.productId')
            console.log(cart);
            const totalAmount = cart.totalAmount - cart.totalDiscount;
            const address = await addressModel.findOne({ userId: userId });
            let isStockEmpty=false ;
            const shippingAddress = address.address.find((item) => item._id.equals(addressId))

            cart.items.forEach(item => {
                if (item.productId.stock === 0 || item.productId.stock < item.quantity) {
                    isStockEmpty =true
       
                  
                }
                
            })
            if(isStockEmpty===true){
                return  res.json({
                    success: false,
                    url: '/cart',
                    message: 'Cant make purchase with out of stock product'
                });
            }

            if (paymentMethod && addressId) {


                const { order, generatedOrderId } = await orderService.generateOrder(userId, addressId)

                if (paymentMethod === 'cod') {

                    await orderModel.findOneAndUpdate(
                        {
                            orderId: generatedOrderId
                        },
                        {
                            paymentMethod: paymentMethod
                        }
                    ).then(async (result) => {

                        await cartModel.findOneAndDelete({ userId: userId })
                        const orderId = result._id
                        console.log(orderId, 'orderIdddd');
                        console.log(result, 'result');
                        orderService.stockUpdate(orderId)
                        res.json({ success: true, paymentMethod: 'cod', orderId })
                    }).catch(err => console.log(err))
                } else if (paymentMethod === 'online') {
                    await orderService.razorpay(generatedOrderId, totalAmount*100)
                        .then((createdOrder) => {
                            
                            res.json({ success: true, createdOrder, paymentMethod: 'online' })
                        }).catch((err)=>{
                           console.error(err)
                           res.json({ success: false, message:'Failed to make payment', paymentMethod: 'online' })
                        })
                }else if(paymentMethod === 'wallet'){
         
                    await orderModel.findOneAndUpdate(
                        {
                            orderId: generatedOrderId
                        },
                        {
                            paymentMethod: paymentMethod
                        }
                    ).then(async (result) => {

                        await cartModel.findOneAndDelete({ userId: userId })
                        const orderId = result._id
                        console.log(orderId, 'orderIdddd');
                        console.log(result, 'result');
                        
                            await userModel.findOneAndUpdate(
                                { _id: userId },
                                { $inc: { walletAmount: -totalAmount } }
                            ).then(()=>{
                                orderService.stockUpdate(orderId)
                                res.json({ success: true, paymentMethod: 'wallet', orderId })
                            })
                        
                    }).catch((err) =>  { 
                        res.json({ success: false, paymentMethod: 'wallet', message: 'Error in making payment' }) 
                    } ) 
                }


            } else {
                if (paymentMethod && !addressId) {
                    res.json({ success: false, message: 'please select shipping address' })
                } else if (!paymentMethod && addressId) {
                    res.json({ success: false, message: 'please select payment method' })
                }

            }

        } catch (error) {
            res.json({ error: 'something went wrong, please try again' })
            console.log(error);
        }

    },
    verifyPayment: async (req, res) => {
        const userId = new mongoose.Types.ObjectId(req.session.user._id)
        try {
            console.log("it is the body", req.body);
            let hmac = crypto.createHmac("sha256", 'JgTsfJUr8zUD26HaeJd0brUM');
            hmac.update(
                req.body.payment.razorpay_order_id +
                "|" +
                req.body.payment.razorpay_payment_id
            );

            hmac = hmac.digest("hex");
            console.log(hmac);
            if (hmac === req.body.payment.razorpay_signature) {

         
                const generatedOrderId = req.body.order.createdOrder.receipt

                await orderModel.findOneAndUpdate({ orderId: generatedOrderId }, {
                    paymentStatus: "Paid",
                    paymentMethod: "Online",
                }, { new: true }).then(async (result) => {
                    console.log(result, 'result');
                    const orderId = result._id;
                    orderService.stockUpdate(orderId);
                    console.log('before deleting');
                    await cartModel.findOneAndDelete({ userId: userId })

                    res.json({ success: true, orderId });
                }).catch(error => {
                    console.log(error);
                })
                console.log("hmac success");

            } else {
                console.log("hmac failed");
                res.json({ failure: true });
            }

        } catch (error) {
            console.log(error);
        }
    },
    getAddAddressCheckout: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id })
            res.render('user/addAddress', { user, cart, wishlist: false, message: req.flash() })
        } catch (error) {
            console.log(error);

        }
    },
    postAddAddressCheckout: async (req, res) => {
        try {

            console.log(req.body);
            const userId = req.session.user._id;
            const data = req.body;
            data.userId = userId;
            // const {name ,mobile,houseName,locality,pincode,district,state} = req.body
            console.log(userId);
            const address = await addressModel.findOne({ userId: userId })

            if (!address) {
                await addressModel.create({ userId: userId, address: [data] })
                req.flash('addressMessage', 'Address added successfully')
                res.redirect('/checkout')
            } else {
                await addressModel.findOneAndUpdate(
                    { userId: userId },
                    {
                        $push: { address: data }
                    }
                ).then((result) => {
                    console.log(result);

                    req.flash('addressMessage', 'Address added successfully')
                    res.redirect('/checkout')

                })
            }

        } catch (error) {
            console.log(error);
            res.render('user/404')
        }
    },
    getOrderSuccess: async (req, res) => {
        const orderId = req.params.id;
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });
            res.render('user/orderSuccess', { user, cart, wishlist: false, orderId })
        } catch (error) {

        }
    },
    getOrders: async (req, res) => {
        try {
            const orders = await orderModel.find({}).populate('items.productId')
          
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });

            res.render('user/orders', {
                user,
                cart,
                orders,
                wishlist: false,
                dates: null,
                message: req.flash()
            })
        } catch (error) {
            console.log(error);
        }
    },
    getOrderDetails: async (req, res) => {
        const orderId = new mongoose.Types.ObjectId(req.params)
        console.log(req.params);
        try {
            const order = await orderModel.findOne({ _id: orderId }).populate('items.productId')

            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });

            res.render('user/orderDetails', {
                user,
                cart,
                wishlist: false,
                order
            })
        } catch (error) {
            console.log(error);
        }
    },
    getCancelOrder: async (req, res) => {
        const orderId = req.params.id;

        try {

            await orderModel.findOneAndUpdate({ _id: orderId }, { status: 'Cancelled' })
                .then(async (result) => {
                    if (result) {
                        const order = result
                        if (result.paymentMethod === 'online') {
                            await userModel.updateOne(
                                { _id: req.session.user._id },
                                { $inc: { walletAmount: order.totalAmount } }
                            ).then(result => {
                                console.log(result);
                            })
                        }
                        for (const item of order.items) {
                            const productId = item.productId;
                            const quantity = item.quantity;

                            const product = await productModel.findOne({ _id: productId })

                          

                            newStock = product.stock + quantity;
                            if (newStock > 0) {
                                await productModel.findOneAndUpdate(
                                    { _id: productId },
                                    {
                                        $set: {
                                            stock: newStock,
                                            status: 'In stock'
                                        }
                                    }
                                )

                            } else {
                                await productModel.findOneAndUpdate(
                                    { _id: productId },
                                    {
                                        $set: {
                                            stock: newStock
                                        }
                                    }
                                )
                            }
                           
                        }
                    }

                })
            req.flash('orderMessage', 'Order Cancelled')
            res.redirect('/orders')
        } catch (error) {
            console.log(error);
        }

    },
    getReturnOrder: async (req, res) => {
        const orderId = req.params.id;
        console.log(req.url);
        try {
            if (req.url === `/cancelReturn/${orderId}`) {
                await orderModel.findOneAndUpdate({ _id: orderId }, { status: 'Delivered' })

                res.redirect('/orders')
            } else if (req.url === `/acceptReturnRequest/${orderId}`) {
                await orderModel.findOneAndUpdate({ _id: orderId }, { status: 'Return Accepted' })
                    .then(async (result) => {
                        console.log(result, 'retern accept');
                        const order = await orderModel.findOne({ _id: orderId })
                        console.log(order);
                        await userModel.updateOne(
                            { _id: req.session.user._id },
                            { $inc: { walletAmount: order.totalAmount } }
                        ).then(result => {
                            console.log(result, 'wallet');
                        })

                    })
                res.redirect('/admin/orderReturnRequest')
            } else if (req.url === `/rejectReturnRequest/${orderId}`) {
                await orderModel.findOneAndUpdate({ _id: orderId }, { status: 'Delivered(Return rejected)' })
                res.redirect('/admin/orderReturnRequest')
            } else {
                await orderModel.findOneAndUpdate({ _id: orderId }, { status: 'Return requested' })
                res.redirect('/orders')
            }

        } catch (error) {
            console.log(error);
        }
    },
    createInvoice: async (req, res) => {

        const orderId = req.params.id;
        console.log(orderId);
        try {
            await orderModel.findOne({ _id: orderId })
                .populate('items.productId')
                .then(async (result) => {
                    console.log(result);
                    await invoiceService.createInvoice(result);
                    res.json({ success: true })
                })
                .catch((error) => {
                    console.log(error);
                    res.json({ success: false, message: "Can't generate Invoice this time" })
                })

        } catch (error) {
            console.log(error);
        }

    },
    downloadInvoice: async (req, res) => {
        const orderId = req.params.id;
        console.log(req.params);
        try {

            const filePath = path.join(__dirname, '..', `/public/pdf/${orderId}.pdf`)
            console.log(filePath);
            res.download(filePath, 'invoice.pdf')

        } catch (error) {
            console.log(error);
        }
    }
}