const path = require('path');
const multer = require('multer');
const fs = require('fs');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const directory = 'public/uploads'
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory)
        }
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const filter = (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpg, .png, and .jpeg formats are allowed'), false);
    }
};


const upload = multer({
    storage: storage,
    fileFilter: filter
})

module.exports = upload;