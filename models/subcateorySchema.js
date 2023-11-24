const mongoose = require('mongoose');
const { SUBCATEGORY } = require('../utils/constants/schemaName')

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: false,

    }
})

const subcategory = mongoose.model(SUBCATEGORY, subcategorySchema);
module.exports = subcategory