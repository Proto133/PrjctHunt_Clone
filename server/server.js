const express = require('express');
const routes = require('./routes');
const path = require('path');
const db = require('./config/connection');
const cors = require('cors');

require('dotenv').config();

const app = express();
const corsOptions = {
    origin: ["https://prjcthunt.xyz", "http://prjcthunt.xyz"]

}

const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);
// if (process.env.NODE_ENV !== 'production') {
// app.use(express.static(path.join(__dirname, "./dist")))
// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, './dist', 'index.html'))
// })}


db.once('open', () => {
    app.listen(PORT, () => {
        // console.log(db.host)
        console.log(`🌍 Now listening on localhost:${PORT}`)

    })
})