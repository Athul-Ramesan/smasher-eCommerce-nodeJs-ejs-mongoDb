const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const bannerSchema = new Schema({
  name: { type: String },
  image: { type: String },
  Video:{type: String},
  status :{type :String,default:"Disabled"},
  carousel :{type:Array},
  date: { type: Date },
});

const bannerModel = mongoose.model('banner', bannerSchema);

module.exports=bannerModel