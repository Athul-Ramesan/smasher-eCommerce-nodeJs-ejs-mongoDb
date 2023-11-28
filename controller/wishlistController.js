const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')

module.exports ={


getWishlist: async (req, res) => {
    const userId = req.session.user._id;
    const date = new Date();
    const user = await userModel.findOne({ _id: userId })
        .populate("wishlist.productId")
        .exec();
        const wishlist = user.wishlist
        const cart = await cartModel.findOne({ userId: req.session.user._id })
    console.log(user.wishlist,'wishlisttt');
    res.render("user/wishlist", { user, date,wishlist,cart });
},

    addToWishlist: async (req, res) => {
        const productId = req.params.id;
        const userId = req.session.user._id;
        const user = await userModel.findById(userId);
        
        const isProductInWishlist = user.wishlist.some(
            (wish) => wish.productId.toString() === productId
        );
        console.log("logginggg", isProductInWishlist);
        if (isProductInWishlist) {
            res.json({ success: false, message: "Product already in Wishlist" });
        } else {
            console.log("inside else");
            const result = await userModel.updateOne(
                {
                    _id: userId,
                },
                { $push: { wishlist: { productId: productId } } }
            );
            // const user = await userModel.findOne({_id:userId})
            const wishlistCount = user.wishlist.length +1
            res.json({ success: true, message: "Added to wishlist",wishlistCount });
        }
    },
        removeFromWishlist: async (req, res) => {
            const productId = req.params.id;
            const userId = req.session.user._id;
            try {
                const updatedWishlist = await userModel.findOneAndUpdate(
                    { _id: userId },
                    { $pull: { wishlist: { productId: productId } } },
                    { new: true }
                );
                res.redirect("/wishlist");
            } catch (error) {
                console.log(error);
            }
        }

    }