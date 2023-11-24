
const easyinvoice = require('easyinvoice')
const fs = require('fs')
const path = require('path');
const moment = require('moment')
module.exports = {

    createInvoice: async (order)=>{
        

        const data = {
            "customize": {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
            },
            "images": {
                // The logo on top of your invoice
                "logo": fs.readFileSync(path.join(__dirname,'..' ,'public/images/logo.png'), 'base64'),
                // The invoice background
                // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
            },
            // Your own data
            "sender": {
                "company": "Smasher",
                "address": "Therveed Road",
                "zip": "670147",
                "city": "Calicut",
                "country": "India"
                //"custom1": "custom value 1",
                //"custom2": "custom value 2",
                //"custom3": "custom value 3"
            },
            // Your recipient
            "client": {
                "company": order.shippingAddress.name,
                "Mob": order.shippingAddress.mobile,
                "House Name": order.shippingAddress.houseName,
                "city": order.shippingAddress.locality,
                "state" : order.shippingAddress.state,
                "country": "India"
                // "custom1": "custom value 1",
                // "custom2": "custom value 2",
                // "custom3": "custom value 3"
            },
            "information": {
                // Invoice number
                "number": order._id,
                // Invoice data
                "date": moment(order.orderedDate).format('MMMM Do YYYY'),
                "due-amount": 270912
                // Invoice due date
                // "due-date": "31-12-2021",
            },
            // The products you would like to see on your invoice
            // Total values are being calculated automatically
            "products": order.items.map((item) => ({
                "quantity": item.quantity,
                "description": item.productId.name,
                "tax-rate" : 0,
                "price": parseInt(item.productId.price-item.productId.discountAmount)

            })),
            // The message you would like to display on the bottom of your invoice
            "bottom-notice": "Thank You for your purchase.",
            // Settings to customize your invoice
            "settings": {
                "currency": "USD",
                "tax-notation": "vat",
                "currency": "INR",
                "tax-notation": "GST",
                "margin-top": 50,
                "margin-right": 50,
                "margin-left": 50,
                "margin-bottom": 25
            },
            // Translate your invoice to your preferred language
            // "translate": {
            //     // "invoice": "FACTUUR",  // Default to 'INVOICE'
            //     // "number": "Nummer", // Defaults to 'Number'
            //     // "date": "Datum", // Default to 'Date'
            //     // "due-date": "Verloopdatum", // Defaults to 'Due Date'
            //     // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
            //     // "products": "Producten", // Defaults to 'Products'
            //     // "quantity": "Aantal", // Default to 'Quantity'
            //     // "price": "Prijs", // Defaults to 'Price'
            //     // "product-total": "Totaal", // Defaults to 'Total'
            //     // "total": "Totaal", // Defaults to 'Total'
            //     // "vat": "btw" // Defaults to 'vat'
            // },
        };
        // if(order.paymentStatus==='pending'){
        //     data.
        // }
        console.log('data',data,'data')
        return new Promise(async(resolve, reject)=>{
            try {
                const result =await easyinvoice.createInvoice(data)
                console.log('result',result ,'result');
                const filePath = path.join(__dirname,'..',`public/pdf/${order._id}.pdf`);
                fs.writeFileSync(filePath,result.pdf,"base64");

                resolve(filePath)
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })
    },
    
}
