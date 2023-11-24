const mongoose = require('mongoose');
const {USER, PRODUCT, ORDER ,ADDRESS} = require('../utils/constants/schemaName')

const orderSchema = new mongoose.Schema({
    orderId : {
        type : String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : USER
    },
    items:[{
        productId :{
            type: mongoose.Schema.Types.ObjectId,
            ref: PRODUCT
        },
        quantity: {
            type: Number
        }
    }],
    orderedDate : {
        type: Date
    },
    deliveredDate : {
        type: Date
    },
    returnDate: {
        type: Date
    },
    expectedDeliveryDate:{
        type: Date
    },
    status:{
        type: String,
        default: 'Order Placed'
    },
    shippingAddress:{
        type: {}
    },
    paymentMethod:{
        type: String
        
    },
    paymentStatus:{
        type: String,
        default: "Pending"
    },
    returnReason:{
        type: String,
    },
    totalAmount:{
        type: Number,
        required: true
    }

})
const order = mongoose.model('ORDER', orderSchema)

module.exports = order;