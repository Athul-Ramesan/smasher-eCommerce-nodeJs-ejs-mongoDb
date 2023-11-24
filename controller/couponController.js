const couponModel = require('../models/couponModel')
const addCoupon = require('../validators/couponValidator')
module.exports = {

    getAdminCoupons: async (req, res, next) => {
        try {
            const coupons = await couponModel.find({})
            res.render('admin/coupons', {
                coupons
            })
        } catch (error) {

            // next(error)
        }

    },

    postAdminAddCoupon: async (req, res) => {

        try {
            console.log(req.body);
            const data = await addCoupon.validateAsync(req.body)


            const coupon = new couponModel(data);
            coupon.save()
            console.log(coupon, 'coupon');

            res.status(201).json({ success: true, message: 'Coupon added successfully' })
        } catch (error) {
            console.log(error);
            if (error.isJoi) {
                const validationErrors = error.details.map((detail) => detail.message);
                res.status(422).send({ errors: validationErrors });
            }
        }

    },
    editAdminCoupon: async (req, res) => {
        const couponId = req.query.id;
        try {
            console.log(req.body,'bodyyy');
            console.log(couponId,'id');
            const body = await addCoupon.validateAsync(req.body)

            await couponModel.updateOne(
                { _id: couponId },
                (body)
              ).then(()=>{
                res.status(201).json({
                    success: true,
                message: 'Coupon updated successfully'
            })
              })
        } catch (error) {
            console.log(error);
            if (error.isJoi) {
                const validationErrors = error.details.map((detail) => detail.message);
                res.status(422).send({ errors: validationErrors });
            }
        }
    }

}