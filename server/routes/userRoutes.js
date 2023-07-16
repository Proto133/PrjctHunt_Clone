const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { UserController } = require('../controllers/UserController')
const { signToken, authMiddleware } = require('../utils/auth');
const { deleteERT, createERT, readERT } = require('../utils/ERT')
const multer = require("multer");
const path = require('path');
const fs = require('fs');


const fileFilter = (req, file, cb) => {
    const ext = file.originalname.split('.').pop();

    if (ext !== 'ert') {
        const error = new Error("Incorrect file");
        error.code = "INCORRECT_FILETYPE";
        return cb(error, false)
    }
    cb(null, true);
}

const upload = multer({
    dest: './ERTs',
    fileFilter,
    // filename,
    limits: {
        fileSize: 100
    }
});

// GET ALL USERS
router.get('/', async (req, res) => {
    const users = await User.find()
    return res.status(200).json(users);
})

router.get('/genERT', async (req, res) => {
    req = await authMiddleware({ req })
    try {
        const ERTContent = await UserController({ type: 'getERT', data: { id: req.user.id } })
        if (!ERTContent) { throw new Error('ERT content not found') }
        console.log(ERTContent.ERT)
        const ERT = await createERT(req.user.id, ERTContent)

        return res.status(200).json({ ERT })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err });
    }
})
router.get('/ERT', async (req, res) => { //
    req = await authMiddleware({ req })
    try {
        const fileName = `${req.user.id}.ert`
        res.status(200).sendFile(path.join(__dirname, '../ERTs', fileName), (err) => { if (err) throw err })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err });
    }
})

router.get('/rmERT', async (req, res) => {
    req = await authMiddleware({ req })
    try {
        const success = await deleteERT(req.user.id)
        console.log(success)
        return res.status(200).json({ success: 'Successfully removed ERT' })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err });
    }
})
router.post('/ERT/login', upload.single('file'), async (req, res) => {
    try {
        async function waitForIt() {
            file = await req.file
            return file
        }
        let file = req.file
        if (!file) {
            waitForIt()
        } else {
            const ERT = await readERT(file.path)
            const success = await UserController({ type: 'ERTLogin', data: { ERT: ERT, ERTpath: file.path } })
            console.log(success)
            return res.status(200).json(success);
        }

    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: err });
    }

})
router.post('/signup', async (req, res) => {
    try {
        // req = await authMiddleware(req)
        console.log("signup")
        const data = await req.body

        const newUser = await UserController({ type: 'signup', data: data });
        if (!newUser) {
            console.log(newUser);
            res.status(400)
                .json({ Error: 'Invalid signup. . . maybe try a different Username' })
            return
        }
        // const token = signToken({ username: newUser.username, id: newUser.id });
        return res.status(200).json({ user: newUser.user, token: newUser.token });

    } catch (err) {
        res.status(500).json({ Error: 'Invalid signup' })
    }
});

router.post('/walletLogin', async (req, res) => {
    req = await authMiddleware({ req })
    // console.log(req.body)
    const data = req.body
    // console.log(data)

    try {
        const loginValid = await UserController({ type: 'walletLogin', data: data })
        if (!loginValid) {
            res.statusMessage = 'Wallet is not associated with an account.'
            res.status(400).json({ Error })
            // .json({ message: 'Incorrect email or password. Please try again!' });
            return;
        }
        const user = loginValid.user;
        const token = loginValid.token;
        // console.log(user)
        // console.log(token)
        return res.status(200).json({ user: user._doc, token: token })

    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});
router.post('/login', async (req, res) => {

    req = await authMiddleware({ req })
    const data = req.body
    try {
        const loginValid = await UserController({ type: 'login', data: data })
        if (!loginValid) {
            res
                .status(401)
                .json({ message: 'Incorrect email or password. Please try again!' });
            return;
        }
        const user = loginValid.user;
        const token = loginValid.token;

        return res.status(200).json({ user: user._doc, token: token })

    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

router.post('/setTokens', async (req, res) => {
    req = await authMiddleware({ req })
    const id = req.user.id
    const tokens = req.body
    console.log({ tokens })
    const success = await UserController({ type: 'setTokens', data: { id: id, tokens: tokens } })
    if (!success) {
        return res.status(400).json({ Error: 'User not found' });
    }
    return res.status(200).json(success);
    // return
})

router.post('/findByToken', async (req, res) => {
    console.log(req.body.token)
    const userID = await UserController({ type: 'findUserByToken', data: { userToken: req.body.token } })
    if (!userID) {
        return res.status(400).json({ Error: 'User not found' });
    }
    return res.status(200).json(userID);
});

router.get('/one/:id', async (req, res) => {
    req = await authMiddleware({ req })
    // ONLY FOR DEV
    let id = req.params.id
    console.log({ id })
    const success = await UserController({ type: 'getUser', data: { id: id } });
    if (!success) {
        return res.status(400).json({ Error: 'User not found' });
    }
    return res.status(200).json(success);

});

router.get('/me', async (req, res) => {
    try {
        req = await authMiddleware({ req })
        // ONLY FOR DEV
        let id = req?.user?.id ? req.user.id : req.body.user
        /*Replace with data: { id: req.user.id } })*/
        const success = await UserController({ type: 'getUser', data: { id: id } });
        if (!success) {
            return res.status(400).json({ Error: 'User not found' });
        }
        return res.status(200).json(success);
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
});

router.post('/me', async (req, res) => {
    req = await authMiddleware({ req })
    if (!req.user) {
        return res.status(401).json({ message: 'Not logged in dog.' })
    }
    try {
        // * Trim @ and all other garbage from value on front-end
        const { field, value } = req.body
        const data = { id: req.user.id, field: field, value: value }
        if (!data) {
            return res.status(400).json({ Error: 'Problem updating profile.' });
        }
        const success = await UserController({ type: 'edit profile', data: data })
        if (!success) {
            return res.status(400).json({ Error: 'Problem updating profile.' });
        }

        return res.status(200).json(success);
    } catch (err) {
        throw err
    }
});

router.get('/favs', async (req, res) => {
    req = await authMiddleware({ req })
    // ONLY FOR DEV
    let id = req?.user?.id ? req.user.id : req.body.user
    if (!id) {
        return res.status(400).json({ Error: 'Failed to fetch favs' })
    }

    /*Replace with data: { id: req.user.id } })*/
    const success = await UserController({ type: 'getFavs', data: { id: id } })
    if (!success) {
        return res.status(400).json({ Error: 'Failed to fetch favs' })
    }
    res.status(200).json({ favorites: success })
})

router.post('/addFav', async (req, res) => {
    req = await authMiddleware({ req })
    const { target } = req.body
    const id = req.user.id
    if (!id) throw new Error('No user logged in');
    // ONLY FOR DEV
    // let id = req?.user?.id ? req.user.id : req.body.user
    /*Replace with data: { target: target, user: req.user.id } })*/
    const success = await UserController({ type: 'addFav', data: { target: target, user: id } });
    if (!success) {
        return res.status(400).json({ Error: 'Failed to add Favorite' })
    }
    res.status(200).json({ ...success })
})

router.post('/rmFav', async (req, res) => {
    try {

        req = await authMiddleware({ req })
        const { target } = req.body
        // ONLY FOR DEV
        const id = req.user.id
        if (!id) throw new Error('No user logged in');
        // let id = req?.user?.id ? req.user.id : req.body.user
        console.log(id)
        /*Replace with data: { target: target, user: req.user.id } })*/
        const success = await UserController({ type: 'removeFav', data: { target: target, user: id } })
        if (!success) {
            return res.status(400).json({ Error: 'Failed to remove favorite' })
        }
        res.status(200).json({ ...success })
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})

module.exports = router