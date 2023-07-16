const router = require('express').Router();
const { projectController } = require('../controllers/ProjectController');
const { authMiddleware } = require('../utils/auth')
// const { verifySignature } = require('../utils/web3Auth')
const db = require('../models');

// GET ALL PROJECTS
router.get('/', async (req, res) => {
    try {
        const projects = await db.Project.find()
        return res.status(200).json(projects);

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.post('/create', async (req, res) => {
    try {

        req = await authMiddleware({ req })
        const { id } = req.user
        const newProject = await projectController({ type: 'create', data: { project: req.body, id: id } });
        if (!newProject) return res.status(400).json({ error: 'Project creation failed.' });
        return res.status(200).json(newProject);
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.get('/get/all', async (req, res) => {
    try {

        const success = await projectController({ type: 'getAll' })
        if (!success) { return res.status(404).json({ error: 'Projects not found.' }); }
        return res.status(200).json(success);
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

})

router.get('/get/:id', async (req, res) => {
    try {

        const target = req.params.id
        const success = await projectController({ type: 'getProject', data: target })
        if (!success) {
            return res.status(400).json({ Error: 'Project Not Found' })

        }
        console.log(success)
        return res.status(200).json(success);
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/remove/:id', async (req, res) => {
    try {

        const target = req.params.id
        const success = await projectController({ type: 'delete', data: target })
        if (!success) {
            return res.apply(400).json({ Error: 'Project Not Found' })

        }
        return res.status(200).json({ result: 'Successfully deleted Project' });
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

})
router.post('/minting/on', async (req, res) => {
    try {

        req = authMiddleware({ req })
        const target = req.body.projectID
        console.log({ Target: target })
        const success = await projectController({ type: 'mintOn', data: { userID: req.user.id, projectID: target } })
        if (!success) {
            return res.status(400).json({ Error: "Mint is still 'off'" })

        }
        return res.status(200).json(success);
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

})

router.post('/minting/off', async (req, res) => {
    try {

        req = authMiddleware({ req })
        const target = req.body.projectID
        const success = await projectController({ type: 'mintOff', data: { userID: req.user.id, projectID: target } })
        if (!success) {
            return res.status(400).json({ Error: "Mint is still 'on'" })

        }
        return res.status(200).json(success);
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

})

router.post('/setMintURL', async (req, res) => {


    req = authMiddleware({ req })
    const data = req.body
    try {
        const success = await projectController({ type: 'setMintURL', data: data })
        if (!success) {
            return res.status(400).json({ Error: err })
        }
        return res.status(200).json(success)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ Error: err })

    }

})

router.post('/upvote', async (req, res) => {
    try {

        console.log('/UPVOTE')
        req = await authMiddleware({ req })
        if (!req.user) {
            console.dir(req)
            return res.status(400).json({ Error: 'Please Login Again. . .' })
        }
        const voter = req.user.id
        console.log({ voter })
        const { target, tokenID } = req.body

        const data = { target: target, voter: voter, tokenID: tokenID }
        const success = await projectController({ type: 'upvote', data: data })
        if (!success) {
            return res.status(400).json({ Error: 'That went wrong . . .' })
        }
        return res.status(200).json({ upvotes: success.upvotes })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/unvote', async (req, res) => {
    try {

        req = await authMiddleware({ req })
        if (!req.user) {
            return res.status(400).json({ Error: 'Please Login Again. . .' })
        }
        const voter = req.user.id
        const { target, tokenID } = req.body
        console.clear()
        console.log({ target })
        console.log({ tokenID })
        const success = await projectController({ type: 'unvote', data: { target: target, voter: voter, tokenID: tokenID } })
        //console.log(success)
        if (!success) {
            return res.status(400).json({ Error: 'That did not work.' })
        }
        return res.status(200).json({ upvotes: success })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/edit/mint', async (req, res) => {

    req = authMiddleware({ req })
    try {
        const userID = req.user.id
        const { target, field, value } = req.body
        const success = await projectController({ type: 'edit mint', data: { target: target, field: field, value: value, hunter: userID } })
        if (!success) { return res.status(400).json({ Error: 'That did not work.' }); }
        return res.status(200).json(success);
    } catch (err) {
        return res.status(500).json({ Error: err.message });
    }
})
router.post('/edit', async (req, res) => {

    req = authMiddleware({ req })
    try {
        const userID = req.user.id
        const { target, field, value } = req.body
        console.log(userID)
        const success = await projectController({ type: 'edit project', data: { target: target, field: field, value: value, hunter: userID } })
        if (!success) { return res.status(400).json({ Error: 'That did not work.' }); }
        return res.status(200).json(success);
    } catch (err) {
        return res.status(500).json({ Error: err.message });
    }
})

router.get("/allupvotes", async (req, res) => {
    try {

        const success = await projectController({ type: 'getUpvotes' });

        if (!success) { return res.status(400).json({ Error: 'That did not work.' }); }
        return res.status(200).json({ upvotes: success });
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.get("/upvotes/:id", async (req, res) => {
    try {

        const success = await projectController({ type: 'getProjectUpvotes', data: { target: req.params.id } });

        if (!success) { return res.status(400).json({ Error: 'That did not work.' }); }
        return res.status(200).json({ upvotes: success });
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.post('/rmupvote', async (req, res) => {
    try {

        //console.log('rmupvote');
        const success = await projectController({ type: 'rmUpvote', data: req.body.id })
        if (!success) { return res.status(400).json({ Error: 'Could not get upvote' }) }
        return res.status(200).json({ Success: success })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }

})
router.get('/getUpvote/:id', async (req, res) => {
    try {

        //console.log(req.params);
        const success = await projectController({ type: 'getUpvoteById', data: { id: req.params.id } });
        if (!success) { return res.status(400).json({ Error: 'Could not get upvote' }) }
        return res.status(200).json({ Success: success })

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.post('/comment', async (req, res) => {
    try {

        const { author, target, content, timestamp } = req.body
        data = { author, target, content, timestamp }
        console.log(data)
        const success = await projectController({ type: 'comment', data: data })
        if (!success) {
            return res.status(400).json({ Error: 'That did not work.' })
        }
        return res.status(200).json({ comment: success })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/uncomment', async (req, res) => {
    try {

        console.log(req.body)
        const { target, commentID } = req.body
        const success = await projectController({ type: 'uncomment', data: { target: target, commentID: commentID } })
        if (!success) { return res.status(500).json({ Error: 'That did not work.' }) }
        return res.status(200).json({ uncomment: success })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.post('/comment/like', async (req, res) => {
    try {
        req = await authMiddleware({ req })
        const userID = req.user.id
        const { commentID } = req.body
        const success = await projectController({ type: 'likeComment', data: { commentID: commentID, userID: userID } })
        console.log({ success })
        if (!success) { return res.status(500).json({ Error: 'That did not work.' }) }
        return res.status(200).json({ commentLike: success })

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.post('/comment/unlike', async (req, res) => {
    try {

        req = await authMiddleware({ req })
        const userID = req.user.id
        const { commentID } = req.body
        const success = await projectController({ type: 'unlikeComment', data: { commentID: commentID, userID: userID } })
        if (!success) { return res.status(500).json({ Error: 'That did not work.' }) }
        return res.status(200).json({ commentLike: success })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.get('/comment/get/:id', async (req, res) => {
    try {

        req = await authMiddleware({ req })
        console.log(req.params)
        const userID = req.user.id
        const commentID = req.params.id
        console.log({ commentID })
        const success = await projectController({ type: 'getCommentById', data: { commentID: commentID, userID: userID } })
        if (!success) { return res.status(500).json({ Error: 'That did not work.' }) }
        return res.status(200).json(success)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
router.get('/comments/:id', async (req, res) => {
    try {

        const target = req.params.id
        // console.log({ target })
        const success = await projectController({ type: 'getAllComments', data: { target: target } });
        if (!success) {
            return res.status(400).json({ Error: 'That did not work.' })
        };
        return res.status(200).json(success)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.get('/search', async (req, res) => {
    try {

        const query = req.query.input
        console.log({ query })
        const success = await projectController({ type: 'search', data: query })
        if (!success) {
            return res.status(400).json({ Error: 'That did not work.' })
        };
        return res.status(200).json(success)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})
module.exports = router;