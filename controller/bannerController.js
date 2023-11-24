const bannerModel = require('../models/bannerModel')
const mongoose = require('mongoose')

module.exports = {
    getAdminBanner: async (req, res) => {
        const currentBanner = await bannerModel.findOne({ status: "Enabled" })
        const banners = await bannerModel.find()
        res.render('admin/banners', { currentBanner: currentBanner, banners: banners, message: req.flash() })
    },

    getAdminAddBanner: async (req, res) => {
        res.render('admin/add-banner',{message: req.flash()})
    },

    postAdminAddBanner: async (req, res) => {
        try {
            const name = req.body.name.trim()
            if(!name){
                req.flash("validation", "Banner name should not be empty")
                return res.redirect('/admin/addBanner')
            }
            console.log(req.files);
            if (req.files['carouselImage1'] &&
                req.files['carouselImage2'] &&
                req.files['carouselImage3']) {
                const carousel = [
                    req.files['carouselImage1'][0].filename,
                    req.files['carouselImage2'][0].filename,
                    req.files['carouselImage3'][0].filename,
                ];
                const newBanner = new bannerModel({
                    name: req.body.name,
                    image: req.files['image'][0].filename,
                    carousel: carousel,
                    Date: new Date(),
                })

                await newBanner.save();
                res.redirect('/admin/banner')
            } else if (req.files['image']) {
                const newBanner = new bannerModel({
                    name: req.body.name,
                    image: req.files['image'][0].filename,
                    carousel: carousel,
                    Date: new Date(),
                })
                await newBanner.save();
                res.redirect('/admin/banner')
            }
        } catch (err) {
            console.log(err, 'in the submit banner catch');
            
            req.flash("validation", "Only .jpg, .png, and .jpeg formats are allowed")
            return res.redirect('/admin/addBanner')
        }
    },

    activateBanner: async (req, res) => {
        try {
            console.log(req.params,'paraaaaaaaaaams');
            const existingBanner = await bannerModel.findOne({ status: "Enabled" });
            const bannerId = new mongoose.Types.ObjectId(req.params.id)
            if (existingBanner) {
                // Change the status of the existing banner to "Disabled"
                existingBanner.status = "Disabled";
                await existingBanner.save();
            }
            if (existingBanner?._id == bannerId) {
                req.flash("existing", "Its the current Status")
                res.redirect('/admin/banner')
            }
            console.log("came here")

            // Activate the new banner
            const banner = await bannerModel.findOneAndUpdate(
                { _id: req.params.id },
                { status: "Enabled" },
                { new: true }
            );

            req.flash("BannerUpdated", "Banner Updated Successfully")
            res.redirect('/admin/banner')
        } catch (error) {
            console.error("Error activating banner:", error);
            res.status(500).json({ error: "Internal Server Error " });
        }
    },

    deleteBanner: async (req, res) => {
        const bannerId = req.params.id
        const result = await bannerModel.findOneAndDelete({ _id: bannerId })
        if (result) {
            // console.log(Banner ${banner} deleted successfully);
            req.flash("BannerDeleted", "Banner Deleted Successfully");
            res.redirect('/admin/banner');
        }
    }
}