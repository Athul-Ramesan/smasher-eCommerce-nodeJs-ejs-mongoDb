const adminModel = require('../models/adminModel');
const categoryModel = require('../models/categoryModel')
const brandModel = require('../models/brandModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const { CATEGORY, BRAND } = require('../utils/constants/schemaName')
const services = require('../services/salesReport')

module.exports = {
    adminLandingPage: (req, res) => {
        res.redirect('/admin/dashboard')
    },
    getAdminDashboard: async (req, res) => {
        try {
            const bestSellingProductsGroup = await orderModel.aggregate([
                {
                    $match: {
                        status: {
                            $nin: ['Rejected', 'Cancelled']
                        }
                    }
                },
                {
                    $unwind: '$items'
                },
                {
                    $group: {
                        _id: '$items.productId',
                        totalProducts: { $sum: '$items.quantity' }
                    }
                },
                {
                    $sort: { 'totalProducts': -1 }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                }
            ]);

            const bestSellingProducts = []
            const totalProducts = []
            let totalProductsCount = 0
            bestSellingProductsGroup.forEach(doc => {
                bestSellingProducts.push(doc.productDetails[0]);
                totalProducts.push(doc.totalProducts);
                totalProductsCount += doc.totalProducts
            })
            
            console.log(bestSellingProducts,'bsashdfl');
            res.render('admin/dashboard', {
                message: req.flash(),
                admin: true,
                bestSellingProducts,
                totalProducts,
                totalProductsCount,
                title: "Admin-Dashboard"
            })
        } catch (error) {
            console.log(error);
        }


    },
    getAdminDashboardData: async (req, res) => {
        console.log(req.url);
        try {
            if (req.url === '/countOrdersByDay') {

                const revenueAndSalesByDay = await orderModel.aggregate([
                    {
                        $match: {
                            status: {
                                $nin: ['Rejected', 'Cancelled']
                            }
                        }
                    },
                    {
                        $unwind: '$items'
                    },
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: {
                                        format: '%Y-%m-%d',
                                        date: '$orderedDate'
                                    }
                                }
                            },
                            totalQuantity: { $sum: '$items.quantity' },
                            revenue: { $sum: '$totalAmount' },
                            sales: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { '_id.date': 1 }
                    }
                ]);



                let totalRevenue = 0;
                let totalSales = 0;
                const timePeriods = [];
                const dataPerPeriod = [];
                const salesPerPeriod = [];
                revenueAndSalesByDay.forEach((doc) => {
                    totalRevenue += doc.revenue;
                    totalSales += doc.sales;
                    timePeriods.push(doc._id.date)
                    dataPerPeriod.push(doc.revenue);
                    salesPerPeriod.push(doc.sales);
                });
                console.log(totalRevenue, 'totalRevenue');
                console.log(totalSales, 'totalSales');
                console.log(timePeriods, 'days');
                console.log(revenueAndSalesByDay, 'revenueAndSalesByWeek');
                res.json({
                    totalRevenue,
                    totalSales,
                    timePeriods,
                    dataPerPeriod,
                    salesPerPeriod,
                    label: 'Daily'
                })


            } else if (req.url === '/countOrdersByWeek') {

                const revenueAndSalesByWeek = await orderModel.aggregate([
                    {
                        $match: {
                            status: {
                                $nin: ['Rejected', 'Cancelled']
                            }
                        }
                    },
                    {
                        $unwind: '$items'
                    },
                    {
                        $group: {
                            _id: {
                                $isoWeek: '$orderedDate',
                            },
                            revenue: { $sum: '$totalAmount' },
                            sales: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ])

                let totalRevenue = 0;
                let totalSales = 0;
                const timePeriods = [];
                const dataPerPeriod = [];
                const salesPerPeriod = [];
                revenueAndSalesByWeek.forEach((doc) => {
                    totalRevenue += doc.revenue;
                    totalSales += doc.sales;
                    timePeriods.push(doc._id)
                    dataPerPeriod.push(doc.revenue);
                    salesPerPeriod.push(doc.sales);
                });
                console.log(totalRevenue, 'totalRevenue');
                console.log(totalSales, 'totalSales');
                console.log(timePeriods, 'weeks');
                console.log(revenueAndSalesByWeek, 'revenueAndSalesByWeek');
                res.json({
                    totalRevenue,
                    totalSales,
                    timePeriods,
                    dataPerPeriod,
                    salesPerPeriod,
                    label: 'Weekly'
                })

            } else if (req.url === '/countOrdersByYear') {
                const revenueAndSalesByYear = await orderModel.aggregate([
                    {
                        $match: {
                            status: {
                                $nin: ['Rejected', 'Cancelled']
                            }
                        }
                    },
                    {
                        $unwind: '$items'
                    },
                    {
                        $group: {
                            _id: {
                                $year: '$orderedDate'
                            },
                            revenue: { $sum: '$totalAmount' },
                            sales: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ])
                let totalRevenue = 0;
                let totalSales = 0;
                const timePeriods = [];
                const dataPerPeriod = [];
                const salesPerPeriod = [];
                revenueAndSalesByYear.forEach((doc) => {
                    totalRevenue += doc.revenue;
                    totalSales += doc.sales;
                    timePeriods.push(doc._id)
                    dataPerPeriod.push(doc.revenue);
                    salesPerPeriod.push(doc.sales);
                });
                console.log(totalRevenue, 'totalRevenue');
                console.log(totalSales, 'totalSales');
                console.log(timePeriods, 'Years');
                console.log(revenueAndSalesByYear, 'revenueAndSalesByYear');
                res.json({
                    totalRevenue,
                    totalSales,
                    timePeriods,
                    dataPerPeriod,
                    salesPerPeriod,
                    label: 'Yearly'
                })


            }


        } catch (error) {
            console.log(error);
        }
    },

    getAdminLogin: async (req, res) => {
        try {
            if (req.session.adminId) {
                res.redirect('/admin/dashboard')
            } else {
                res.render('admin/admin-login', { 
                    message: req.flash(),
                    title:"Admin-Login" })
            }

        } catch (error) {

        }

    },
    postAdminLogin: async (req, res) => {
        try {

            const admin = await adminModel.findOne({ email: req.body.email })
            if (!admin) {
                req.flash('adminLoginError', 'User name or password is incorrect')
                res.redirect('/admin/login')
            } else {
                if (req.body.password !== admin.password) {
                    req.flash('adminLoginError', 'User name or password is incorrect')
                    res.redirect('/admin/login')
                } else {

                    const adminId = admin._id;
                    req.session.adminId = adminId

                    res.redirect('/admin/dashboard')
                }

            }

        } catch (error) {
            console.log(error);
        }
    },
    getOtp: async (req, res) => {
        res.render('otp-verification', { message: req.flash() });
    },
    postOtp: async (req, res) => {
        try {

        } catch (error) {

        }
    },

    getCustomers: async (req, res) => {
        const itemsPerPage = 10;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;
        try {
            totalItems = await userModel.countDocuments();
            const totalPages = Math.ceil(totalItems / itemsPerPage)

            const users = await userModel
                .find()
                .skip(skip)
                .limit(itemsPerPage);

                console.log(users,'users');

            res.render("admin/customers", {
                users,
                currentPage,
                totalPages,
                message: req.flash()
            })


        } catch (error) {
            console.log(error);
        }

    },
    postAdminSearchUser: async (req, res) => {
        const query = req.body.query;
        try {
            await userModel.find({ name: { $regex: query, $options: 'i' } })
                .then(async (result) => {
                    if (result !== null && query.length > 0) {
                        const users = result
                        const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
                        const perPage = 10; // Number of items per page
                        const totalCount = result.length


                        res.render("admin/customers", {
                            users,
                            currentPage: page,
                            perPage,
                            totalCount,
                            totalPages: Math.ceil(totalCount / perPage),
                            message: req.flash()
                        })
                    } else {
                        req.flash('adminUserMessage', 'No user found')
                        res.redirect('/admin/customers')
                    }
                })
        } catch (error) {
            console.log(error);
            req.flash('adminUserMessage', 'Something went wrong')
            res.redirect('/admin/customers')
        }
    },
    getAdminBlockUser: async (req, res) => {
        try {
            console.log(req.params);
            const id = req.params.id;
            const user = await userModel.findOne({ _id: id })

            if (user.status === 'Active') {
                const result = await userModel.updateOne({ _id: id }, { status: 'Blocked' })
                // console.log(result); 
                if (result.modifiedCount === 1) {
                    res.redirect('/admin/customers')
                }
            } else {
                const result = await userModel.updateOne({ _id: id }, { status: 'Active' })
                if (result.modifiedCount === 1) {
                    res.redirect('/admin/customers')
                }
            }



        } catch (error) {
            console.log(error);
        }

    },
    liveSearchUser: async (req, res) => {
        const query = req.query.q
        try {
            console.log(query);
            const users = await userModel.find(
                {
                    name:
                        { $regex: query, $options: 'i' }
                }
            )
            res.json({ users })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred while searching users' })
        }
    },
    // liveSearchProduct :async(req,res)=>{
    //     const query = req.query.q;
    //     try {
    //         const products = await productModel.find({name: 
    //             {$regex :query, $options: 'i'}})
    //             res.json({products})
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({ error: 'An error occurred while searching products' })
    //     }
    // },
    getAdminLogout: async (req, res) => {
        try {
            req.session.adminId = null
            res.redirect('/admin/login')
        } catch (error) {
            console.log(error);
        }

    },
    downloadSalesReport : async (req,res)=>{
        console.log(req.body);
        try {
            const { startDate, endDate, fileFormat} = req.body;

            console.log(startDate,endDate,'askjdfhlkjhsdfo');

            console.log(new Date(startDate),'new date');
            // const totalSales = await orderModel.aggregate([
            //     {
            //       $match: {
            //         paymentStatus: 'Paid',
            //         orderedDate: {
            //           $gte: new Date(startDate),
            //           $lte: new Date(endDate),
            //         },
            //       },
            //     },
            //     {
            //       $group: {
            //         _id: '$orderId', // Group by orderId or another unique identifier
            //         totalSales: {
            //           $sum: '$totalAmount',
            //         },
            //       },
            //     },
            //     {
            //       $group: {
            //         _id: null, // Group all results into a single group
            //         grandTotalSales: {
            //           $sum: '$totalSales',
            //         },
            //       },
            //     },
            //   ]);
              
            //   console.log(totalSales);
              
              
              
            
            
          
            // const sum = totalSales.length > 0 ? totalSales[0].totalSales : 0

            if(fileFormat === 'pdf'){
                await orderModel.find({
                    paymentStatus: "Paid",
                    orderedDate : {
                        $gte : new Date(startDate),
                        $lte : new Date(endDate)
                    }
                }).then(async(result)=>{
    
                    const sum = result.reduce((sum,order)=> sum+order.totalAmount,0)
    
                    if(fileFormat ==='pdf'){
                        const filePath= await services.pdfSalesReport(result,startDate,endDate,sum)
                        console.log(filePath);
                       res.download(filePath,'sales-report.pdf')
                    }else{
                        const filePath= await services.excelSalesReport(result,startDate,endDate,sum)
                        console.log(filePath);
                        res.download(filePath)
                    }
                   
                }).catch(err=>{
                    console.log(err);
                })
            }else{
                // for excel download
            }
            
        } catch (error) {
            console.log(error);
        }
    }


}