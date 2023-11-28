
const categoryModel = require('../models/categoryModel')
const brandModel = require('../models/brandModel');
const productModel = require('../models/productModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName');
const { default: mongoose } = require('mongoose');
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')
module.exports = {

    getAdminCategoriesAndBrands: async (req, res) => {
        try {

            const categories = await categoryModel.find({})
            const brands = await brandModel.find({})


            res.render('admin/categories', {
                categories,
                brands,
                message: req.flash(),
                title: 'Categories & Brands'
            })
        } catch (error) {
            console.log(error);
        }

    },

    getAdminAddCategory: (req, res) => {

        res.render('admin/add-category', { title: 'Admin-add-cat' })
    },
    postAdminAddCategory: async (req, res) => {
        try {
            console.log(req.body,'aasdfasfa');
            const name = req.body.category.trim()
            if(!name){
                req.flash('categoryMessage', "Please enter a valid name")
                return res.redirect('/admin/categoriesAndBrands')
            }
            const newCategory = new categoryModel({
                name: req.body.category
            })
            await newCategory.save();
            req.flash('categoryMessage', "New category added succesfully")
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            if(error.code===11000){
                req.flash('categoryMessage', "Cannot add same category")
                res.redirect('/admin/categoriesAndBrands')
            }
            console.log(error);
        }

    },

    getAdminEditCategory: async (req, res) => {
        try {
            const categoryId = req.params.id

            const category = await categoryModel.findOne({ _id: categoryId })

            res.render('admin/edit-category', {
                category,
                title: 'admin-edit-cat'
            })

        } catch (error) {
            console.log(error);
        }

    },
    postAdminEditCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            await categoryModel.findOneAndUpdate({ _id: categoryId }, { name: req.body.name })
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
        }
    },
    getTennis: async(req,res)=>{

        console.log('inside gettennis');
        const itemsPerPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            const category = await categoryModel.findOne({name:'Tennis'})
            const categoryId= category._id
            console.log(category,'category');
            const totalItems = await productModel.find({category:new mongoose.Types.ObjectId(categoryId)}).countDocuments();
            console.log(totalItems,'totalItems');
            const totalPages = Math.ceil(totalItems / itemsPerPage)



            const products = await productModel
                .find({ active: true, category:new mongoose.Types.ObjectId(categoryId) })
                .skip(skip)
                .limit(itemsPerPage)

            const categories = await categoryModel.find()
            const brands = await brandModel.find()

            if (req.session.user) {
                const user = await userModel.findById(req.session.user._id)
                const cart = await cartModel.findOne({ userId: req.session.user._id })
                res.render('user/tennis', {
                    currentPage,
                    totalPages,
                    products,
                    user,
                    brands,
                    cart,
                    categories,
                    wishlist: false,
                    message: req.flash()
                })
            } else {
                console.log('inside gettennis no user');
                res.render('user/tennis', {
                    currentPage,
                    totalPages,
                    products,
                    brands,
                    categories,
                    user: req.session.user,
                    cart: false,
                    wishlist: false,
                    message: req.flash()
                })
            }

        } catch (error) {
            console.log(error);
        }
    },
    getBadminton: async(req,res)=>{
       
        const itemsPerPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            const category = await categoryModel.findOne({name:'Badminton'})
            const categoryId= category._id
          
            const totalItems = await productModel.find({category:new mongoose.Types.ObjectId(categoryId)}).countDocuments();
            console.log(totalItems,'totalItems');
            const totalPages = Math.ceil(totalItems / itemsPerPage)



            const products = await productModel
                .find({ active: true, category:new mongoose.Types.ObjectId(categoryId) })
                .skip(skip)
                .limit(itemsPerPage)

            const categories = await categoryModel.find()
            const brands = await brandModel.find()

            if (req.session.user) {
                const user = await userModel.findById(req.session.user._id)
                const cart = await cartModel.findOne({ userId: req.session.user._id })
                res.render('user/badminton', {
                    currentPage,
                    totalPages,
                    products,
                    user,
                    brands,
                    cart,
                    categories,
                    wishlist: false,
                    message: req.flash()
                })
            } else {
                console.log('inside getbadminton no user');
                res.render('user/badminton', {
                    currentPage,
                    totalPages,
                    products,
                    brands,
                    categories,
                    user: req.session.user,
                    cart: false,
                    wishlist: false,
                    message: req.flash()
                })
            }

        } catch (error) {
            console.log(error);
        }
    },
    getSquash: async(req,res)=>{
        const itemsPerPage = 5;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            const category = await categoryModel.findOne({name:'Squash'})
            const categoryId= category._id
          
            const totalItems = await productModel.find({category:new mongoose.Types.ObjectId(categoryId)}).countDocuments();
            console.log(totalItems,'totalItems');
            const totalPages = Math.ceil(totalItems / itemsPerPage)



            const products = await productModel
                .find({ active: true, category:new mongoose.Types.ObjectId(categoryId) })
                .skip(skip)
                .limit(itemsPerPage)

            const categories = await categoryModel.find()
            const brands = await brandModel.find()

            if (req.session.user) {
                const user = await userModel.findById(req.session.user._id)
                const cart = await cartModel.findOne({ userId: req.session.user._id })
                res.render('user/squash', {
                    currentPage,
                    totalPages,
                    products,
                    user,
                    brands,
                    cart,
                    categories,
                    wishlist: false,
                    message: req.flash()
                })
            } else {
                console.log('inside getsquash no user');
                res.render('user/squash', {
                    currentPage,
                    totalPages,
                    products,
                    brands,
                    categories,
                    user: req.session.user,
                    cart: false,
                    wishlist: false,
                    message: req.flash()
                })
            }

        } catch (error) {
            console.log(error);
        }
    },
    getTennisRackets: async(req,res)=>{
       
            const itemsPerPage = 5;
            const currentPage = parseInt(req.query.page) || 1;
            const skip = (currentPage - 1) * itemsPerPage;
            try {
                const category = await categoryModel.findOne({name:'Tennis'})
                const categoryId= category._id
              
                const totalItems = await productModel.find({category:new mongoose.Types.ObjectId(categoryId),subcategory:'Racket'}).countDocuments();
                console.log(totalItems,'totalItems');
                const totalPages = Math.ceil(totalItems / itemsPerPage)
    
    
                const products = await productModel
                    .find({ active: true, category:new mongoose.Types.ObjectId(categoryId),subcategory:'Racket' })
                    .skip(skip)
                    .limit(itemsPerPage)
    
                const categories = await categoryModel.find()
                const brands = await brandModel.find()
    
                if (req.session.user) {
                    const user = await userModel.findById(req.session.user._id)
                    const cart = await cartModel.findOne({ userId: req.session.user._id })
                    res.render('user/subCategory', {
                        currentPage,
                        totalPages,
                        products,
                        user,
                        brands,
                        cart,
                        categories,
                        wishlist: false,
                        message: req.flash()
                    })
                } else {
                    console.log('inside getsquash no user');
                    res.render('user/subCategory', {
                        currentPage,
                        totalPages,
                        products,
                        brands,
                        categories,
                        user: req.session.user,
                        cart: false,
                        wishlist: false,
                        message: req.flash()
                    })
                }
    
            } catch (error) {
                console.log(error);
            }
    }


}