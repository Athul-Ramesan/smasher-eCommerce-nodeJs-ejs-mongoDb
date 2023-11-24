const bcrypt = require("bcrypt");

const userModel = require('../models/userModel');
const productModel = require('../models/productModel')
const otpModel = require('../models/otpModel')
const cartModel = require('../models/cartModel')
const otpService = require('../services/otpService')
const sendMail = require('../validators/nodeMailer');
const { userDetailsValidation } = require('../validators/userDetailsValidation')
const { default: mongoose } = require("mongoose");
const bannerModel = require('../models/bannerModel')





const hash = (password) => {
    try {
        return bcrypt.hash(password, 10);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {

    landingPage: async (req, res) => {
        res.redirect('/home')
    },
    home: async (req, res) => {
        const products = await productModel.find({});
        const banner = await bannerModel.findOne({ status: 'Enabled' })
        console.log(banner,'banner');
        if (req.session && req.session.user) {

            const id = req.session.user._id
            const cart = await cartModel.findOne({ userId: id })
            console.log(cart, 'cart');
            res.render('user/home', {
                user: req.session.user,
                products,
                cart,
                wishlist: false,
                banner,
                message: req.flash()
            });
        } else {
            res.render('user/home', { 
                user: false,
                 products ,
                 banner
                })
        }


    },
    postSignup: async (req, res) => {
        try {
            let { name, email, password, confirmPassword } = req.body;
            name = name.trim()
            email = email.trim()
            password = password.trim()


            if (name == "" || email == "" || password == "") {
                req.flash('userSignupError', 'Empty input fields')
                res.redirect('/signup')
            } else if (!/^[A-Za-z\s'-]+$/.test(name)) {
                req.flash('userSignupError', 'Invalid Name entered')
                res.redirect('/signup')
            } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                req.flash('userSignupError', 'Invalid email entered')
                res.redirect('/signup')
            } else if (password.length < 8) {
                req.flash('userSignupError', 'Password is too short')
                res.redirect('/signup')
            } else {

                const findUser = await userModel.findOne({ email: req.body.email })
                if (findUser) {
                    req.flash('userSignupError', 'user already exists')
                    res.redirect('/signup')
                } else {
                    if (password !== confirmPassword) {
                        req.flash('userSignupError', 'Password do not match')
                        res.redirect('/signup')
                    } else {

                        req.session.user = req.body

                        await otpService.sendOtp(req.session.user.email)

                        res.redirect('/otpverification')
                    }

                }
            }

        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    },
    getSignup: (req, res) => {
        try {
            console.log(req.query);

            if (req.session.user) {
                res.redirect('/home')
            } else {
                req.session.referalUserId = req.query.referalUserId;
                res.render('user/signup', { message: req.flash() })
            }

        } catch (error) {
            console.log(error);
        }

    },

    getLogin: async (req, res) => {
        try {
            if (req.session.user) {
                res.redirect('/home')
            } else {
                res.render('user/login', {
                    message: req.flash(),
                    title: 'Smasher-Login'
                })
            }

        } catch (error) {
            console.log(error);
            res.render('user/404')
        }

    },
    postLogin: async (req, res) => {
        try {
            let { email, password } = req.body;
            email = email.trim();
            password = password.trim();

            if (email == "" || password == "") {
                req.flash('userLoginError', 'Empty input fields')
                res.redirect('/login')
            } else {
                const user = await userModel.findOne({ email: req.body.email });

                if (!user) {
                    req.flash('userLoginError', 'Email or Password is invalid')
                    res.redirect('/login')
                } else {


                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else if (result) {
                            if (user.status === 'Active') {
                                req.session.user = user;

                                console.log(user);
                                res.redirect('/home')
                            } else {
                                req.flash('userLoginError', 'You have been blocked')
                                res.redirect('/login')
                            }
                        } else {
                            req.flash('userLoginError', 'Email or Password is invalid')
                            res.redirect('/login')
                        }
                    })
                }
            }


        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    },
    getVerifyEmail: async (req, res) => {
        res.render('user/verify-email', { message: req.flash() })
    },
    postVerifyEmail: async (req, res) => {
        try {
            const email = req.body.email;
            console.log(email);
            const findUser = await userModel.findOne({ email: email })
            if (!findUser) {
                req.flash('verifyEmailError', 'please enter a valid email')
                res.redirect('/forgotPassword')
            } else if (findUser.status === 'Blocked') {
                console.log(findUser);
                req.flash('verifyEmailError', 'Your account has been blocked !')
                res.redirect('/forgotPassword')
            } else {

                req.session.userEmail = email
                console.log(req.session);
                otpService.sendOtp(req.session.userEmail)
                res.redirect('/otpVerificationPassword')
            }

        } catch (error) {
            console.log(error);
        }

    },
    getOtpVerificationPassword: async (req, res) => {
        try {
            res.render('user/otp-verification-password', { message: req.flash() })
        } catch (error) {
            console.log(error);
        }


    },
    postOtpVerificationPassword: async (req, res) => {
        try {
            console.log('postotp');
            console.log(req.session.userEmail);
            const generatedOtp = await otpModel.findOne({ userEmail: req.session.userEmail })
            const enteredOtp = req.body.otp;

            console.log(enteredOtp, generatedOtp.otp);

            if (generatedOtp.otp === enteredOtp) {

                res.redirect('/setNewPassword')
            } else if (generatedOtp.otp !== enteredOtp) {

                req.flash('otpError', 'Failed to match otp')
                res.redirect('/otpVerificationPassword')
            }
        } catch (error) {
            console.log(error);
        }
    },
    getSetNewPassword: (req, res) => {
        try {
            res.render('user/new-password', { message: req.flash() })
        } catch (error) {
            console.log(error);
        }
    },
    postSetNewPassword: async (req, res) => {

        try {
            const { newPassword, confirmPassword } = req.body
            const email = req.session.userEmail
            const user = await userModel.findOne({ email: email })

            console.log(user);


            if (newPassword === confirmPassword) {
                const hashedNewPassword = await bcrypt.hash(newPassword, 10)
                await userModel.findOneAndUpdate({ email: email }, { password: hashedNewPassword })

                req.session.user = user
                console.log(req.session);
                res.redirect('/home')
            } else {
                req.flash("newPasswordError", "Password matching failed")
                res.redirect('/setNewPassword')
            }



        } catch (error) {
            console.log(error);
        }
    },

    resendOtp: async (req, res) => {
        try {
            const email = req.session.user.email
            await otpService.sendOtp(email);
            res.redirect('/otpverification');
        } catch (error) {
            console.log(error);
        }
    },
    getVerifyOtp: async (req, res) => {
        try {

            res.render('otp-verification', { message: req.flash() })
        } catch (error) {
            console.log(error);
        }


    },
    postVerifyOtp: async (req, res) => {
        try {
            const generatedOtp = await otpModel.findOne({ userEmail: req.session.user.email })
            const enteredOtp = req.body.otp;
            console.log(enteredOtp, generatedOtp);

            if (generatedOtp.otp === enteredOtp) {
                const user = req.session.user
                console.log('req.session before signup ', req.session);
                const hashedPassword = await hash(user.password);

                await userModel.create(
                    {
                        name: user.name,
                        email: user.email,
                        password: hashedPassword,
                        walletAmount: 0
                    })


                const newUser = await userModel.findOne({ email: user.email })
                req.session.user = newUser

                if (req.session.referalUserId) {
                    
                    await userModel.updateOne(
                        { _id: req.session.referalUserId },
                        { $inc: { walletAmount: 50 } } 
                        
                    ).then(result=>{
                        console.log(result);
                    })
                }

                res.redirect('/home')
            } else if (generatedOtp.otp !== enteredOtp) {
                req.flash('otpError', 'Failed to match otp')
                res.redirect('/otpverification')
            }
        } catch (error) {
            console.log(error);
        }


    },

    getProfile: async (req, res) => {
        try {
            const user = await userModel.findOne({ email: req.session.user.email });
            const cart = await cartModel.findOne({ userId: req.session.user._id })
            res.render('user/profile', {
                user,
                cart,
                wishlist: false,
                title: 'User-profile'
            })

        } catch (error) {
            console.log(error);
        }

    },
    postChangePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            const user = await userModel.findOne({ _id: req.session.user._id });

            console.log(user, 'user');

            const storedPassword = user.password;

            const match = await bcrypt.compare(currentPassword, storedPassword)

            if (match) {
                if (newPassword === confirmPassword) {
                    const checkNewPassword = await bcrypt.compare(newPassword, storedPassword)
                    if (checkNewPassword) {
                        res.json({ error: 'Your current password and new password are same' })
                    } else {
                        const password = await bcrypt.hash(newPassword, 10);
                        console.log(password);
                        await userModel.findOneAndUpdate({ _id: req.session.user._id }, { password: password })
                        console.log(res);
                        res.json({ success: true })
                    }

                } else {
                    res.json({ error: 'Both new password and confrim password must be same' })
                }

            } else {
                res.json({ error: 'Current password must be valid' })
            }

        } catch (error) {
            console.log(error);
        }

    },
    editUserDetails: async (req, res) => {
        try {
            console.log(req.body);
            let body = await userDetailsValidation.validateAsync(req.body, { abortEarly: false })
            console.log(body, 'bodyyyyyyyyyy');

            await userModel.findOneAndUpdate({ _id: req.session.user._id }, body)
                .then(async () => {
                    user = await userModel.findOne({ _id: req.session.user._id })
                    const newName = user.name
                    const newMobile = user.mobile;

                    res.status(201).json({ success: true, newName, newMobile, message: 'Updated Successfully' })
                })

        } catch (error) {
            console.log(console.log(error));
            if (error.isJoi) {
                const validationErrors = error.details.map((detail) => detail.message);
                res.status(422).send({ errors: validationErrors });
            }
        }

    },


    getLogout: (req, res) => {
        req.session.user = null;
        req.session.userId = null;
        res.redirect('/home')
    }
}

