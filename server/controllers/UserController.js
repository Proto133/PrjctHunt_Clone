const bcrypt = require('bcrypt');
const { Project, Comment, User, Upvote } = require('../models');
const { signToken } = require('../utils/auth')
const { createERT, deleteERT } = require('../utils/ERT')
const salt = 10

async function UserController({ type, data }) {
    let dbUser
    let walletLogin
    let token
    switch (type) {
        case 'login':
            dbUser = await User.findOne({ username: data.username })

            if (!dbUser) {
                console.log('No user found for username')
                return false
            }
            const comparison = await bcrypt.compare(data.password, dbUser.password);

            if (!comparison) {
                console.log('Password does not match database.');
                return false;
            }
            dbUser.updateOne({ $set: { lastOnline: data.lastOnline, isOnline: true } })
            if (!dbUser.avatar) {
                await dbUser.updateOne({ avatar: `https://avatars.dicebear.com/api/identicon/${dbUser.username}.svg` })
            }
            if (!dbUser.ERT) {
                const ERT = await bcrypt.hash(`${dbUser.username}${dbUser.password}${dbUser._id}`, salt)
                await dbUser.updateOne({ ERT: ERT });
            }
            await dbUser.updateOne({ generic_token: `G-${dbUser.id}` });
            console.dir(dbUser)
            token = signToken({ username: dbUser.username, id: dbUser.id });
            return { user: dbUser, token: token }
            break;
        case 'walletLogin':
            try {
                walletLogin = await User.findOneAndUpdate({ wallet: data.wallet }, { $set: { lastOnline: data.lastOnline, isOnline: true } }, { new: true });
                if (!walletLogin) return false;
                token = signToken({ username: walletLogin.username, id: walletLogin.id })
                return { user: walletLogin, token: token }
            } catch (err) { return false; }
            break;
        case 'signup':
            try {
                const existingUser = await User.findOne({ username: data.username })
                if (existingUser) {
                    console.log(existingUser);
                    return
                }
                let newUser = await User.create({ ...data })
                console.log(newUser);
                const ERT = await bcrypt.hash(`${newUser.username}${newUser.password}${newUser._id}`, salt)
                dbUser = await User.findOneAndUpdate({ _id: newUser._id }, {
                    $set: {
                        generic_token: `G-${newUser.id}`,
                        // wallet: data.wallet ? data.wallet : null,
                        twitter: data.twitter ? data.twitter : '',
                        discordID: data.discordID ? data.discordID : '',
                        isOnline: true,
                        lastOnline: data.lastOnline,
                        ERT: ERT
                    }
                }, { new: true });
                console.log({ dbUser })
                token = signToken({ username: dbUser.username, id: dbUser.id });

            } catch (err) {
                console.log(err);
                return false;
            }
            break;
        case 'getERT':
            try {
                const user = await User.findOne({ _id: data.id });
                console.log(user.ERT);
                if (!user) { return false; }
                return user.ERT
            } catch (err) { return false; }

            break;
        case 'ERTLogin':
            try {
                const user = await User.findOneAndUpdate({ ERT: data.ERT }, { $set: { lastOnline: Date.now(), isOnline: true } }, { new: true });
                if (!user.avatar) {
                    await user.updateOne({ avatar: `https://avatars.dicebear.com/api/identicon/${user.username}.svg` })
                }
                await user.updateOne({ generic_token: `G-${user.id}` });
                let filename = data.ERTpath.split('/').pop()
                filename = filename.split('.').pop()
                console.log(filename)
                await deleteERT(filename, true)
                token = signToken({ username: user.username, id: user.id });
                return { user: user, token: token }

            } catch (err) {
                console.log(err);
                return false;
            }
            break;
        case 'setTokens':
            try {
                // data.tokens = [...data.tokens, `G-${data.id}`]
                // console.log({ STData: data.tokens })
                const user = await User.findOneAndUpdate({ _id: data.id }, { $set: { tokens: data.tokens } });
                // console.log({ user: user })
                if (user?.tokens.length > 1) {

                    await user.updateOne({ isHolder: true }).exec()
                }


                return user.tokens;
                // return data
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'getFavs':
            try {
                // console.log(data.id)
                const user = await User.findById(data.id)
                    .populate({
                        path: 'favorites', model: 'Project', populate: [{
                            path: 'upvotes', model: 'Upvote'
                        }, {
                            path: 'hunter_id', model: 'User', select: ['username', 'avatar']
                        }, {
                            path: 'comments', model: 'Comment'
                        }]
                    });
                // console.log(user)
                const favorites = await user.favorites
                console.log(favorites)
                return favorites
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'addFav':
            try {
                const project = await Project.findById(data.target)
                const user = await User.findOneAndUpdate({ _id: data.user }, { $addToSet: { favorites: project._id } }, { new: true }).populate({ path: 'favorites', model: 'Project', populate: { path: 'upvotes', model: 'Upvote' } });
                return user
            } catch (err) { return false; }
            break;
        case 'removeFav':
            try {
                const project = await Project.findById(data.target)
                // console.log(project.id)
                const user = await User.findOneAndUpdate({ _id: data.user }, { $pull: { favorites: project._id } }, { new: true }).populate({ path: 'favorites', model: 'Project' })
                return user._doc
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'findUserByToken':
            try {
                const user = await User.findOne({ $or: [{ tokens: { $in: data.userToken } }, { generic_token: data.userToken }] })
                    .populate({
                        path: 'favorites',
                        model: 'Project',
                        select: ['_id', 'name', 'hunter', 'thumbnail']
                    }).select('-password')
                console.log(user)
                return user
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'getUser':
            try {
                const user = await User.findById(data.id)
                    .populate({
                        path: 'favorites',
                        model: 'Project',
                        select: ['_id', 'name', 'hunter', 'thumbnail']
                    })
                const huntedProjects = await Project.find({ hunter_id: data.id })               // .populate({ path: 'favorites', model: 'Project', populate: { path: 'upvotes', model: 'Upvote' } });
                return { user: user, huntedProjects: huntedProjects }
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'edit profile':
            try {
                if (data.field === 'password') {
                    const saltRounds = 10;
                    data.value = await bcrypt.hash(data.value, saltRounds);
                }
                const user = await User.findOneAndUpdate({ _id: data.id }, {
                    [data.field]: data.value
                }, { new: true })
                // .populate('favorites', 'name');

                // console.log({ user })
                return user

            } catch (err) {
                console.log(err)
                return false;
            }
    }
    return { user: dbUser, token: token };
}

module.exports = { UserController };