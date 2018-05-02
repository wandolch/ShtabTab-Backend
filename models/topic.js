const mongoose = require('mongoose');

module.exports.createCollection = () => {
  const schema = new mongoose.Schema({
    id:{
      type: String,
      required: true,
      unique:true
    },
    created:{
      type:Date,
      default: Date.now
    }
  });

  mongoose.model('Topic', schema);
};