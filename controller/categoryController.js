
const categoryModel = require('../models/categoryModel')
const brandModel = require('../models/brandModel');
const productModel = require('../models/productModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName')

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


}