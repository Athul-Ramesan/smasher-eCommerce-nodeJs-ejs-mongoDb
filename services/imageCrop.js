const sharp = require('sharp')
const fs = require('fs');

module.exports = {

cropImage :async (inputPath, outputPath, cropOptions)=>{

        try {
            const imageBuffer = fs.readFileSync(inputPath);

            // Perform cropping using sharp
            await sharp(imageBuffer)
              .extract(cropOptions)
              .toFile(outputPath);
            
            console.log('Image cropped and saved successfully!');
          } catch (error) {
            console.error('Error cropping image:', error);
          }
        

    
}

}



