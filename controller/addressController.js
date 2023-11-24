const addressModel = require('../models/addressModel')
const userModel = require('../models/userModel');
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel');
const mongoose = require('mongoose');
const {addAddress} = require('../validators/addressValidator')

module.exports = {
    getAddress: async (req, res) => {
        try {
            const userId = req.session.user._id
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id });
            const addresses = await addressModel.findOne({ userId: userId })
            res.render('user/address', {
                user,
                cart,
                wishlist: false,
                addresses,
                message: req.flash()
            })

        } catch (error) {
            console.log(error);

        }
    },
    getAddAddress: async (req, res) => {
        console.log(req.url);
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id })
            if(req.url === '/addAddress'){
                res.render('user/addAddress', {
                    user,
                    cart,
                    wishlist: false,
                    message: req.flash(),
                    profile:true,
                    checkout:false
                })
            }else if(req.url === '/addAddressCheckout'){
                res.render('user/addAddress', {
                    user,
                    cart,
                    wishlist: false,
                    message: req.flash(),
                    checkout:true,
                    profile:false
                })
            }
                        
        } catch (error) {
            console.log(error);

        }
    },
    postAddAddress: async (req, res) => {
        try {
            console.log(req.body,'req.bodyyyyyyyy');
            let body = await addAddress.validateAsync(req.body, { abortEarly: false })
            
            console.log(body,'bodyyyyyyyyyyyyyy');

            const userId = req.session.user._id;
            const data = { ...body, userId };
            // const {name ,mobile,houseName,locality,pincode,district,state} = req.body
            
            const address = await addressModel.findOne({ userId: userId })
            
            if(req.url==='/addAddress'){
                if (!address) {
                    await addressModel.create({ userId: userId, address: [data] })
                    .then(result=>{
                        res.status(201).send({result: result ,message: 'Address added successfully'})
                    })
                    
                } else {
                    await addressModel.findOneAndUpdate(
                        { userId: userId },
                        {
                            $push: { address: data }
                        }
                    ).then((result) => {
                        console.log(result);    

                        res.status(201).send({result: result, message: 'Address added successfully'})
    
                    })
                }
            }else if(req.url==='/addAddressCheckout'){
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
            }
 
        } catch (error) {

            console.log(error);
          
            if (error.isJoi) {
                const validationErrors = error.details.map((detail) => detail.message);
                res.status(422).send({ errors: validationErrors });
            } 
        }

    },
    // getEditAddress: async (req, res) => {
    //     try {

            

    //         const addressId = req.params.id;
    //         const userId = req.session.user._id
    //         const userAddress = await addressModel.findOne({ userId: userId })
    //         const address = userAddress.address.find((item) => item._id.equals(addressId))

    //         const user = await userModel.findOne({ email: req.session.user.email });

    //         const cart = await cartModel.findOne({ userId: req.session.user._id })

    //         res.render('user/editAddress', {
    //             user,
    //             cart,
    //             wishlist: false,
    //             address,
    //             message: req.flash()
    //         })
    //     } catch (error) {
    //         console.log(error);
    //     }
    // },
    postEditAddress: async (req, res) => {
        try {
            
            console.log(req.body,'req.bodyyyyyyyy');
            let body = await addAddress.validateAsync(req.body, { abortEarly: false })
            // console.log(body);
            console.log(body,'bodyyyyyyyyyyyyyy');

            // const userId = req.session.user._id;
            const data = { ...body};

            console.log(data,'data');

            const addressId = new mongoose.Types.ObjectId(req.query.addressId);
            const userId = new mongoose.Types.ObjectId(req.session.user._id)
            await addressModel.findOneAndUpdate(
                { userId: userId, 'address._id': addressId },
                {
                    $set:
                        { 'address.$': data }
                },
            ).then((result) => {
                res.status(201).send({result: result, message: 'Address added successfully'})
            }).catch((err) => {
                console.log(err,'error inside then catch');
            })
            
        } catch (error) {
            if (error.isJoi) {
                const validationErrors = error.details.map((detail) => detail.message);
                res.status(422).send({ errors: validationErrors });
            } 
        }
    },
    getDeleteAddress: async (req, res) => {
        try {
            const userId = req.session.user._id
            const addressId = req.params.id
            console.log(addressId);
            await addressModel.findOneAndUpdate(
                { userId: userId },
                { $pull: { address: { _id: addressId } } },
                { new: true }
            ).then((result) => {
                console.log(result);
                res.redirect('/address')
            })

        } catch (error) {

        }
    }
}