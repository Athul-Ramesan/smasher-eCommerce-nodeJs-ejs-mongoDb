const mongoose = require('mongoose');


const otpVerificationSchema = new mongoose.Schema({
    userEmail: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date
})

const otp = mongoose.model('otp', otpVerificationSchema)

module.exports = otp