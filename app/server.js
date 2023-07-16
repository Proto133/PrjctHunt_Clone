const express = require('express');
const serveStatic = require("serve-static")
const path = require('path');
const history = require('connect-history-api-fallback')
const cors = require('cors')
const allowedOrigins = ['*'];
// Used for Development
// const corsOptions = {
//       'Access-Control-Allow-Origin': '*'
// }

require('dotenv').config();
const app = express();
if (process.env.NODE_ENV === 'production') {
  app.use(serveStatic(path.join(__dirname, 'dist')));
}
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 3000;

app.use(history())


app.listen(port, () => {
  console.log(path.join(__dirname, '../client/dist'))
  console.log(`Server listening on http://localhost:${port}`)
})