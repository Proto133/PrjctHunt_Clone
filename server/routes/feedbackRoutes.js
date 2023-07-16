const router = require('express').Router();
const { authMiddleware } = require('../utils/auth')
const { User } = require('../models')
const { Webhook, MessageBuilder } = require("discord-webhook-node")

router.post('/', async (req, res) => { //
    req = authMiddleware({ req });
    console.clear();

    try {
        const user = await User.findOne({ _id: req.user.id })
        const { category, title, description } = req.body
        // console.log(category)
        let url
        switch (category) {
            case 'General Feedback':
                url = `https://discord.com/api/webhooks/${process.env.GENERAL_ID}/${process.env.GENERAL_TOKEN}`

                break;
            case 'Feature Request':
                url = `https://discord.com/api/webhooks/${process.env.FEATURE_ID}/${process.env.FEATURE_TOKEN}`
                break;
            case 'Bug Report':
                url = `https://discord.com/api/webhooks/${process.env.BUG_ID}/${process.env.BUG_TOKEN}`
                break;
            case 'Question':
                url = `https://discord.com/api/webhooks/${process.env.QUESTION_ID}/${process.env.QUESTION_TOKEN}`
                break;
            default:
                break;
        }
        if (!user.email) user.email = 'No Email'
        if (!user.discord) user.discord = 'No Discord'
        if (!user.twitter) user.twitter = 'No Twitter'
        // console.log(user.username)
        // console.log(url)
        const hook = new Webhook(url)
        // console.log(req.body)
        const embed = new MessageBuilder()
            .setTitle(title)
            .setAuthor(user.username, user.avatar)
            .setURL(`https://prjctHunt.xyz/${user.generic_token}`)
            .addField('\u200b', '\u200b')
            .addField('Twitter', user.twitter, true)
            .addField('Discord', user.discord, true)
            .addField('Email', user.email, true)
            .addField('\u200b', '\u200b')
            .setColor('#00b0f4')
            .setDescription(description)
            .setTimestamp();

        await hook.send(embed);

        res.status(200).json({ message: 'Success' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }

})

module.exports = router