const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
// const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };


const nftSchema = new Schema({ 
   token_id: String,
   img_src: String,
   token_name: String,
   gov_weight: Number,
   gov_type: String,
})

const Nft = mongoose.model("Project", nftSchema);

module.exports = Nft;
