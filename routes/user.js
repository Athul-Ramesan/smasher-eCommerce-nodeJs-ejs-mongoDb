const express = require('express');
const router = express.Router()

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../middleware/authentication')
const cartController = require('../controller/cartController')
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const categoryController = require('../controller/categoryController');


router.get('/', userController.landingPage)
router.get('/home',auth.verifyUser,userController.home)    ///here auth auth.verifyUser,

router.get("/signup", userController.getSignup)
router.post("/signup", userController.postSignup);

router.get('/login', userController.getLogin)
router.post('/login', userController.postLogin)

router.get('/forgotpassword', userController.getVerifyEmail)
router.post('/forgotpassword', userController.postVerifyEmail)

// router.get('/resendOtpPassword',userController.getResendOtpPassword)

router.get('/setNewPassword',userController.getSetNewPassword)
router.post('/setNewPassword',userController.postSetNewPassword)

router.get('/otpverification', userController.getVerifyOtp)
router.post('/otpverification', userController.postVerifyOtp)



router.get('/otpVerificationPassword', userController.getOtpVerificationPassword)
router.post('/otpVerificationPassword', userController.postOtpVerificationPassword)
router.get('/resendOtp', userController.resendOtp)


router.get('/productView/:id',auth.verifyUser,productController.getProductView) ///here auth auth.verifyUser,

router.get('/shopProduct',auth.verifyUser, productController.getShopProduct) ///here auth auth.verifyUser,
router.post('/filterProducts',productController.postFilterProdcuts)
router.post('/searchProduct',productController.postSearchProduct)


router.get('/cart',auth.auth,auth.verifyUser,cartController.getCart)


router.post('/addToCart/:id',cartController.getAddToCart)
router.post('/updateCartQuantity',cartController.postUpdateCartQuantity)
router.get('/removeFromCart/:id',auth.auth,auth.verifyUser,cartController.getRemoveFromCart)
router.post('/applyCoupon',auth.auth,auth.verifyUser,cartController.applyCoupon)
router.delete('/applyCoupon',auth.auth,auth.verifyUser,cartController.removeCoupon)

router.get('/profile',auth.auth, userController.getProfile)
router.post('/editUserDetails',userController.editUserDetails)

router.post('/changePassword',userController.postChangePassword)

router.get('/address',auth.auth,addressController.getAddress)
router.put('/address',auth.auth,addressController.postEditAddress)
// router.get('/addAddress',auth.auth,addressController.getAddAddress)
router.post('/addAddress',auth.auth,addressController.postAddAddress)

// router.get('/editAddress/:id',addressController.getEditAddress)
router.post('/editAddress/:id',addressController.postEditAddress)

router.get('/deleteAddress/:id',addressController.getDeleteAddress)

router.get('/orders',auth.auth,auth.verifyUser,orderController.getOrders)
router.get('/orderDetails/:id',auth.auth,auth.verifyUser,orderController.getOrderDetails)
router.get('/cancelOrder/:id',auth.auth,auth.verifyUser,orderController.getCancelOrder)
router.get('/returnOrder/:id',auth.auth,auth.verifyUser,orderController.getReturnOrder)
router.get('/cancelReturn/:id',auth.auth,auth.verifyUser,orderController.getReturnOrder)


router.get('/createInvoice/:id',auth.auth,auth.verifyUser,orderController.createInvoice)
router.get('/downloadInvoice/:id',auth.auth,auth.verifyUser,orderController.downloadInvoice)


router.get('/checkout',auth.auth,auth.verifyUser,orderController.checkout)

router.post('/checkout',auth.auth,auth.verifyUser,orderController.postCheckout)
router.get('/addAddressCheckout',auth.auth,auth.verifyUser,addressController.getAddAddress)
router.post('/addAddressCheckout',auth.auth,auth.verifyUser,addressController.postAddAddress)
router.post('/verifyPayment',auth.auth,auth.verifyUser,orderController.verifyPayment)



router.get('/orderSuccess/:id',auth.auth,auth.verifyUser,orderController.getOrderSuccess)
router.get('/logout', userController.getLogout)
module.exports = router

