const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Active"
    },
    mobile: {
        type: Number

    },
    walletAmount :{
        type: Number
    }
}, { timestamps: true });


const user = mongoose.model('User', userSchema)
module.exports = user
