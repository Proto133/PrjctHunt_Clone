const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = process.env.JWT_SECRET || 'prjctHuntSecret';
const expiration = '2h';

module.exports = {
    // function for our authenticated routes
    authMiddleware: function ({ req }) {
        // console.log({ 'auth middleware': req })
        // allows token to be sent via  req.query or headers
        let token = req?.body?.token || req?.query?.token || req.headers.authorization;

        // ["Bearer", "<tokenvalue>"]
        if (req.headers.authorization) {
            token = token.split(' ').pop().trim();
        }
        if (!token) {
            console.log(`\n\nNO TOKEN\n\n`)
            return req;
        }

        // verify token and get user data out of it
        try {
            const { data } = jwt.verify(token, secret, { maxAge: expiration });
            console.log(data)
            req.user = data;
        } catch {
            console.log('Invalid token');
        }

        return req;
        // // send to next endpoint
        // next();
    },
    signToken: function ({ username, id }) {
        // console.log(typeof id)
        // console.log({ username })
        const info = { username: username, id: id, token_id: `G-${id}`, img_src: `https://avatars.dicebear.com/api/identicon/${username}.svg`, token_name: `Explorer-${username}`, gov_weight: 0, gov_type: `Explorer` }
        // console.log(info)
        return jwt.sign({ data: info }, secret, { expiresIn: expiration });
    },
};