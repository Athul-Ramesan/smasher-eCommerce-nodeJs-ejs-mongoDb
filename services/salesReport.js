const htmlPdf = require('html-pdf')
const fs = require('fs')
const ejs = require('ejs')
const path = require('path')
const Excel = require('excel4node')

module.exports = {

    pdfSalesReport : async (orders,startDate,endDate,totalSales)=>{
        try {
            return new Promise((resolve,reject)=>{
                console.log('hereeeeeeeeeee');
                const template = fs.readFileSync('services/templateSR.ejs','utf-8');
                console.log(orders);
                const html = ejs.render(template,{orders, startDate, endDate, totalSales});
        
                const pdfOptions= {
                    format: 'Letter',
                    orientation: 'portrait'
                }
        
                htmlPdf.create(html,pdfOptions).toFile(`public/SRpdf/sales-report-${startDate}-${endDate}.pdf`,(err,response)=>{
                    if(err){
                        console.log(err);
                    }
                    resolve(response.filename)
                })

            })
            
        } catch (error) {
         
            console.log(error);
        }
    },
    excelSalesReport : async(orders,startDate,endDate,totalSales)=>{
        try {
            return new Promise((resolve,reject)=>{
                console.log('hereeeeeeeeeee');
                const template = fs.readFileSync('services/templateSR.ejs','utf-8');
                console.log(orders);
                const htmlContent = ejs.render(template,{orders, startDate, endDate, totalSales});

                const workbook = new Excel.Workbook();
                const worksheet = workbook.addWorksheet('Sheet 1')

                const folderPath = `public/SRpdf/sales-report-${startDate}-${endDate}.pdf`
                 

                worksheet.html(htmlContent);

                workbook.write(folderPath,(err)=>{
                    if(err){
                        console.error('error saving exceel file',err)
                        
                    }
                    resolve(folderPath)
                })
                console.log(workbook.html(html),'htmllllll');


            })
        } catch (error) {
            console.log(error);
        }
    }
}