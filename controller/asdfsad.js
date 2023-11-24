//// excel format downloading

salesReport: async (req, res) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    if(new Date(startDate) > new Date()){
        req.flash('error',"please select a past date for generating Sales Report")
        return res.redirect('/admin/dashboard')
    }else if(new Date(endDate) > new Date()){
        req.flash('error',"please select a past date for generating Sales Report")
        return res.redirect('/admin/dashboard')
    }

    const generateSalesData = async () => {
        try {
            // Fetch orders data from the database
            const orders = await Orders.find({
                DeliveredDate: { $exists: true },
                PaymentStatus: 'Paid',
                OrderedDate: {
                    $gte:startDate,
                    $lte:endDate,
                },
            }).populate('Products.ProductId');

            // Filter by payment status

            // Map orders data to the required format for Excel
            return orders.map(order => {
                const products = order.Products.map(product => ({
                    product: product.ProductId.ProductName,
                    quantity: product.Quantity,
                    userId: order.UserId,
                    price: product.ProductId.DiscountAmount,
                    total: product.Quantity * product.ProductId.DiscountAmount,
                }));

                // Calculate total amount for the order
                const totalAmount = products.reduce((total, product) => total + product.total, 0);

                return {
                    order: order._id,
                    orderedDate: order.OrderedDate, // Add the ordered date
                    products,
                    totalAmount,
                };
            });
        } catch (error) {
            throw error;
        }
    };

    try {
        // Generate Excel Report
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add some sample data
        worksheet.columns = [
            { header: 'User Id', key: 'User', width: 30 },
            { header: 'Order', key: 'order', width: 30 },
            { header: 'Ordered Date', key: 'orderedDate', width: 30 }, // Add Ordered Date column
            { header: 'Price', key: 'price', width: 10 },
            { header: ' ₹ Total Sales ', key: 'total', width: 15 },
        ];

        const salesData = await generateSalesData();

        // Add sales data to the worksheet
        let totalAmount = 0; // Initialize total amount for each order
        salesData.forEach(order => {
            order.products.forEach(product => {
                worksheet.addRow({
                    User: product.userId,
                    order: order.order,
                    orderedDate: order.orderedDate, // Include ordered date
                    price: order.totalAmount,
                    total: totalAmount += order.totalAmount, // Sum of each order's total amount
                });
            });
        });

        // Set response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

        // Send the workbook as a buffer
        workbook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (err) {
        console.log(err, 'err in the sales report');
    }
}



const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
 },
});





/*


*/
