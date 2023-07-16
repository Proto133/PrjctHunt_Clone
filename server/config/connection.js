const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI
console.log(typeof uri)
mongoose.connect(uri || 'mongodb://localhost/PrjctHunt', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Mongo Connected')).catch((err) => console.error(err));
// console.log(mongoose.connection)
module.exports = mongoose.connection;