const mongoose = require("mongoose");

const Schema = mongoose.Schema;
// const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };


const tagSchema = new Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
    // index:true
  }
})

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
