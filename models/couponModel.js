const mongoose = require("mongoose");
const { COUPON, USER } = require("../utils/constants/schemaName");

const couponSchema = new mongoose.Schema(
  {
    couponName: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    minimumOrderAmount: {
      type: Number,
      required: true,
    },
    maximumDiscountableAmount: {
      type: Number,
      required : true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    maxUseCount: {
      type: Number,
      default: 2
    },
    users: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER
      },
      usedCount: {
        type: Number,
        default: 1
      }
    }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const couponModel =mongoose.model(COUPON, couponSchema);

module.exports = couponModel