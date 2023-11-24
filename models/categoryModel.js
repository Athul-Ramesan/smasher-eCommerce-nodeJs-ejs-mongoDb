const mongoose = require('mongoose');
const { CATEGORY } = require('../utils/constants/schemaName')
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }

})
const category = mongoose.model(CATEGORY, categorySchema)
module.exports = category;