const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const otpModel = require('../models/otpModel');





module.exports = {
    sendOtpVerificationEmail: async (otp, email) => {
        try {

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.AUTH_MAIL,
                    pass: process.env.AUTH_PASSWORD,
                }
            });
            //mail options

            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Verify Your Email",
                html: `<p> Enter <b> ${otp} <b> in the app`
            };



            // const hashedOtp = await bcrypt.hash(otp, 10)

            await otpModel.create({
                userEmail: email,
                otp: otp,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60
            })
            setTimeout(() => {
                otpModel.deleteOne({ userEmail: email }).then(() => {
                    console.log('otp doc deleted successfully');
                }).catch((error) => {
                    console.log(error);
                })
            }, 30000)
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            })
        } catch (error) {
            if (error) {
                console.log(error);
            }
        }
    }
}





