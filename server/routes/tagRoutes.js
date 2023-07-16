const router = require('express').Router();
const { Tag } = require('../models');
// const bcrypt = require('bcrypt');
// const { userController } = require('../controllers/userController')
// const { signToken, authMiddleware } = require('../utils/auth');
const baseTags = ['DeFi', 'DAO', 'Game', 'Staking', 'LaunchPad', 'Tools', 'Metaverse', 'PFP', '3D', 'Passive Income', 'P2E', 'IRL Application', 'Native Token', 'Degen']

router.get('/', async (req, res) => {
    const tags = await Tag.find()
    if (!tags) { return res.status(200).json({ message: 'No tags found' }) }
    const result = tags.map(tag => { return tag.tag })
    return res.status(200).json(result)
})

router.post('/add/many', async (req, res) => {
    try {
        console.log(req.body)
        const newTags = req.body.tags
        newTags.forEach(async (tag) => {
            const newtag = await Tag.create(tag)
            console.log(newtag)
            if (!newtag) { return { error: 'Error creating tag' } }
        })
        const dbTags = await Tag.find()
        return res.status(200).json({ tags: dbTags });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})
router.post('/add', async (req, res) => {
    try {
        console.log(req.body)
        const newtag = await Tag.create({ ...req.body })
        console.log(newtag)
        if (!newtag) { return res.status(404).json({ error: 'Error creating tag' }) }
        return res.status(200).json(newtag)
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})

router.post('/rmtag', async (req, res) => {
    try {
        const target = req.body.tag
        await Tag.findOneAndDelete({ tag: target }, { returnOriginal: true })
        res.status(200).json({ message: 'Tag deleted successfully.' })
    } catch (err) {
        console.log(err);
        return res.status(500).json(err)
    }
})

router.post('/rebase', async (req, res) => {
    try {
        await Tag.deleteMany({})
        baseTags.forEach(async (tag) => {
            await Tag.create({ tag: tag })
        })
        res.status(200).json({ message: 'Tags rebased' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error rebasing tags' });
    }
})

module.exports = router