const mongoose = require('mongoose');
const {OFFER,CATEGORY,PRODUCT} = require('../utils/constants/schemaName')

const offerSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : PRODUCT
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:CATEGORY,
        unique: true
    },
    type: {
        type: String
    },
    discountPercentage: {
        type: Number
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        default : 'Active'
    }

},{timestamps: true})

const offerModel = mongoose.model(OFFER, offerSchema) 
module.exports = offerModel