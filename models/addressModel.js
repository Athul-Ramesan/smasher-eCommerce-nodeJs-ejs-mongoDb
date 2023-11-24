const mongoose = require('mongoose');
const {ADDRESS,USER} = require('../utils/constants/schemaName')
const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER
    },
    address : [{
        name: {
            type: String,
            required: true
        },
        mobile:{
            type: Number,
            required : true
        },
        houseName:{
            type: String,
            required : true
        },
        locality:{
            type: String,
            required : true
        },
        pincode : {
            type: Number,
            required : true
        },
        district :{
            type: String
        },
        state : {
            type: String
        }
    
    }]
    


})
const address = mongoose.model(ADDRESS, addressSchema)

module.exports = address;
