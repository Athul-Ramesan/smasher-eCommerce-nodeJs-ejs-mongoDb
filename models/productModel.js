const mongoose = require('mongoose')
const { USER, PRODUCT, CATEGORY, SUBCATEGORY, BRAND } = require('../utils/constants/schemaName')

const procuctSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter product name'],
    min: [3, 'At least 3 characters needed'],

  },
  productImage1: {
    type: String,
  },
  productImage2: {
    type: String,
  },
  productImage3: {
    type: String,
  },
  price: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  details: {
    type: String,
    required: false
  },
  specifications: {
    type: String,
    required: false
  },
  rating: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CATEGORY
  },
  subcategory: {
    type: String,
    enum: {
      values: ['Racket', 'String', 'Ball']
    }
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: BRAND
  },
  stock: {
    type: Number,
    required: [false, 'please enter product stock']
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      name: {
        type: String,
        required: false
      },
      rating: {
        type: Number,
        require: false
      },
      comment: {
        type: String,
        required: false
      }
    }
  ],
  tags: {
    type: Array,
    required: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,

  },
  status: {
    type: String,
    default: 'In stock'
  },
  currentDiscountPercentage: {
    type: Number
  },
  isDiscountApplied: {
    type: Boolean,
    default: false
  }
})

const product = mongoose.model(PRODUCT, procuctSchema)
module.exports = product