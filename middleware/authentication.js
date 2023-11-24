
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')


module.exports = {
    verifyAdmin: (req, res, next) => {
        if (req.session && req.session.adminId) {
            next()
        } else {
            res.redirect('/admin/login')
        }
    },
    verifyUser: async (req, res, next) => {
        try {

            const products = await productModel.find({})
            if (req.session && req.session.user) {
                const user = await userModel.findOne({ _id: req.session.user._id })
                if(user){
                    if (user.status === 'Blocked') {
                        req.session.user = null;
                        req.session.userId = null
                        next()
                    } else {
                        next();
                    }
                }
                

            } else {
                req.session.user = false;
                req.session.userId = null
                next()
            }
        } catch (error) {
            console.log(error);
        }


    },
    auth :async(req,res,next)=>{
        try {
            if (req.session && req.session.user) {
                const user = await userModel.findOne({ _id: req.session.user._id })
                if (user.status === 'Blocked') {
                    req.session.user = null;
                    req.session.userId = null
                    next()
                } else {
                    next();
                }

            } else {
                req.session.user = false;
                req.session.userId = null
                res.redirect('/home')
            }
        } catch (error) {
            console.log(error);
        }
    }
}

