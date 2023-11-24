const express = require('express');
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../middleware/uploadImages')
const auth = require('../middleware/authentication');
const productController = require('../controller/productController')
const categoryController = require('../controller/categoryController')
const brandController = require('../controller/brandController')
const orderController = require('../controller/orderController')
const offerController = require('../controller/offerController')
const couponController = require('../controller/couponController')
const bannerController  = require('../controller/bannerController')
router.get('/login', adminController.getAdminLogin)
router.post('/login', adminController.postAdminLogin)


router.use(auth.verifyAdmin)   // protecting admin routes

router.get('/', adminController.adminLandingPage)
router.get('/dashboard',  adminController.getAdminDashboard)
router.get('/countOrdersByDay',adminController.getAdminDashboardData)
router.get('/countOrdersByWeek',adminController.getAdminDashboardData)
router.get('/countOrdersByYear',adminController.getAdminDashboardData)

router.post('/downloadSalesReport',adminController.downloadSalesReport)

router.get('/products',  productController.getAdminProduct)
router.post('/adminSearchProduct', productController.postAdminSearchProduct)

router.get('/addProduct',  productController.getAdminAddProdcuct)

router.post('/addproduct', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), productController.postAdminAddProduct)

router.get('/editProduct/:id',  productController.getAdminEditProduct)

router.post('/editProduct/:id', upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 }
]), productController.postAdminEditProduct)

router.get('/hideProduct/:id',  productController.getAdminHideProduct)

router.get('/categoriesAndBrands',  categoryController.getAdminCategoriesAndBrands)


router.post('/addCategory', categoryController.postAdminAddCategory)


router.post('/addBrand', brandController.postAdminAddBrand)

router.get('/editBrand/:id',  brandController.getAdminEditBrand)
router.post('/editBrand/:id', brandController.postAdminEditBrand)

router.get('/editCategory/:id',  categoryController.getAdminEditCategory)
router.post('/editCategory/:id', categoryController.postAdminEditCategory)


router.get('/customers',  adminController.getCustomers)
router.get('/blockUser/:id',  adminController.getAdminBlockUser)
router.post('/adminSearchUser', adminController.postAdminSearchUser)

router .get('/orders',orderController.getAdminOrders)
router .get('/orderDetails/:id',orderController.getAdminOrderDetails)
router.put('/updateOrderStatus',orderController.putAdminUpdateOrderStatus)
router.get('/orderReturnRequest',orderController.getAdminOrderReturnRequest)
router.get('/acceptReturnRequest/:id',orderController.getReturnOrder)
router.get('/rejectReturnRequest/:id',orderController.getReturnOrder)

router.get('/offers',offerController.getAdminOffer)
router.post('/addProductOffer',offerController.addProductOffer)
router.post('/addCategoryOffer',offerController.addCategoryOffer)
router.get('/removeProductOffer/:id',offerController.removeOffer)
router.get('/removeCategoryOffer/:id',offerController.removeOffer)


router.get('/coupons',couponController.getAdminCoupons)
router.post('/coupons',couponController.postAdminAddCoupon)
router.put('/coupons',couponController.editAdminCoupon)

router.get('/banner',bannerController.getAdminBanner)
router.get('/addBanner',bannerController.getAdminAddBanner)
router.post('/addBanner',upload.fields([
    { name: 'image', maxCount: 1 },
{ name: 'carouselImage1', maxCount: 1 },
{ name: 'carouselImage2', maxCount: 1 },
{ name: 'carouselImage3', maxCount: 1 }
]),bannerController.postAdminAddBanner)
router.get('/activate-banner/:id',bannerController.activateBanner)
router.get('/delete-banner/:id',bannerController.deleteBanner)

router.get('/logout', adminController.getAdminLogout)
module.exports = router