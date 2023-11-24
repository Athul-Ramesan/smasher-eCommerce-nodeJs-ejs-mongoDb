const brandModel = require('../models/brandModel')

module.exports = {
    postAdminAddBrand: async (req, res) => {
        try {
            const name = req.body.brand.trim()

            if(!name){
                req.flash('bandMessage', "Please enter the brand")
                return res.redirect('/admin/categoriesAndBrands')
            }
            const newBrand = new brandModel({
                name: name
            })
            await newBrand.save();
            req.flash('bandMessage', "New brand added succesfully")
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            if(error.code===11000){
                req.flash('bandMessage', "Cannot add same brand")
                res.redirect('/admin/categoriesAndBrands')
            }
        }
    },
    getAdminEditBrand: async (req, res) => {
        try {
            const brandId = req.params.id

            const brand = await brandModel.findOne({ _id: brandId })
            console.log(brand);
            res.render('admin/edit-brand', { brand })

        } catch (error) {
            console.log(error);
        }

    },
    postAdminEditBrand: async (req, res) => {
        try {
            const brandId = req.params.id;
            console.log(brandId);
            await brandModel.findOneAndUpdate({ _id: brandId }, { name: req.body.name })
            res.redirect('/admin/categoriesAndBrands')
        } catch (error) {
            console.log(error);
        }
    }
}