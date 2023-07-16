const { Project, Upvote, User, Comment } = require('../models')

async function projectController({ type, data }) {
    let project
    switch (type) {
        case 'create':
            try {
                if (!data.project.hunter) {
                    data.project.hunter = `G-${data.id}`
                }
                data.project.hunter_id = data.id
                project = await Project.create(data.project)

            } catch (err) { return false; }
            break;
        case 'delete':
            try {
                project = await Project.findByIdAndRemove(data)
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'getProject':
            try {
                project = await Project.findById(data)
                    .populate({ path: 'hunter_id', model: 'User', select: 'username avatar' })
                return project
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'mintOn':
            try {
                project = await Project.findOneAndUpdate({ _id: data.projectID }, { $set: { 'mint_info.mintingNow': true } }, { new: true });
                console.log(project.name, project.mint_info.mintingNow)
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'mintOff':
            try {
                project = await Project.findOneAndUpdate({ _id: data.projectID }, { $set: { 'mint_info.mintingNow': false, 'mint_info.url': '' } }, { new: true });
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'setMintURL':
            try {
                project = await Project.findOneAndUpdate({ _id: data.projectID }, { $set: { 'mint_info.url': data.mintURL } }, { new: true });
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'getAll':
            try {
                projects = await Project.find()
                    .populate({ path: 'hunter_id', model: 'User', select: ['username', 'avatar'] })
                    .populate({ path: 'upvotes', model: 'Upvote' })
                    .populate({ path: 'comments', model: 'Comment' })
                return projects
            } catch (err) { console.log(err); return false; }
            break;
        case 'upvote':
            try {
                console.log('Upvote')
                const user = await User.findById(data.voter).populate({ path: 'favorites', model: 'Project' })
                // console.log({ user })
                if (!user) { return false }
                const upvote = await Upvote.create({ target: data.target, voter: data.voter, token: data.tokenID })
                project = await Project.findOneAndUpdate({ _id: data.target }, { $addToSet: { upvotes: upvote._id } }, { new: true })
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'unvote':
            try {
                // console.clear();
                console.log('Unvote')
                const user = await User.findById(data.voter).populate({ path: 'favorites', model: 'Project', populate: { path: 'upvotes', model: 'Upvote' } })
                if (!user) {
                    console.log('No User found')
                    return false
                }

                const upvote = await Upvote.findOne({ $and: [{ token: data.tokenID, target: data.target }] });
                // console.log({ Upvote: upvote })

                project = await Project.findOneAndUpdate({ _id: data.target }, { $pull: { upvotes: upvote._id } }, { new: true })
                await Upvote.findByIdAndRemove(upvote._id);
            } catch (err) {
                console.log(err)
                return false;
            }
        case 'getUpvotes':
            try {
                // console.log(data)
                const upvotes = await Upvote.find();
                // console.log(
                //     upvotes
                // )
                return upvotes
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'getProjectUpvotes':
            try {
                console.log({ getProjUPvotes: data })
                const upvotes = await Upvote.find({ target: data.target });
                console.log(
                    upvotes
                )
                return upvotes
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'getUpvoteById':
            try {
                // console.log(data)
                const upvote = await Upvote.findById(data.id);
                // console.log(
                //     upvote
                // )
                return upvote
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'rmUpvote':
            try {
                console.log(data)
                const upvote = await Upvote.findByIdAndRemove(data);
                console.log(
                    upvote
                )
                return upvote
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'comment':
            try {
                const user = await User.findById(data.author)
                const comment = await Comment.create({ target: data.target, author: user, content: data.content, timestamp: data.timestamp })
                console.log({ comment })
                project = await Project.findOneAndUpdate({ _id: data.target }, { $addToSet: { comments: comment } }, { new: true })
                return project.comments
            } catch (err) {
                console.log(err)
                return false
            }
            break;
        case 'likeComment':
            try {
                const comment = await Comment.findOneAndUpdate({ _id: data.commentID }, { $addToSet: { likes: data.userID } }, { new: true })
                return comment
            } catch (err) {
                console.log(err);
                return false;
            }
            break;
        case 'unlikeComment':
            try {
                const comment = await Comment.findOneAndUpdate({ _id: data.commentID }, { $pull: { likes: data.userID } })
                return comment
            } catch (err) {
                console.log(err)
                return false;
            }
            break;
        case 'uncomment':
            try {
                const comment = await Comment.findOne({ _id: data.commentID })
                console.log(comment)
                project = await Project.findOneAndUpdate({ _id: data.target }, { $pull: { comments: comment._id } }, { new: true }).populate({ path: 'comments', model: 'Comment' })
                await Comment.deleteOne({ _id: comment._id });
            } catch (err) {
                console.log(err)
                return false
            }
            break;
        case 'getAllComments':
            try {
                const comments = await Comment.find({ target: data.target }).populate({ path: 'author', model: 'User' })
                if (!comments) return false
                return comments
            } catch (err) {
                console.log(err)
                return false
            }
            break;
        case 'getCommentById':
            try {
                const comment = await Comment.findOne({ _id: data.commentID })
                if (!comment) return false
                return comment
            } catch (err) {
                console.log(err)
                return false
            }
            break;
        case 'search':
            try {
                const query = new RegExp(data, 'i')
                let results = { projects: [], users: [] }
                results.projects = await Project.aggregate([
                    // Project the concatenated full name along with the original doc
                    { $project: { proj: { $concat: ['$name', '$summary', '$tagline'] }, doc: '$$ROOT' } },
                    {
                        $match: { $or: [{ proj: query }, { tags: query }] }
                    },
                    { $lookup: { from: 'Upvote', localField: 'upvotes', foreignField: '_id', as: 'upvotes' } },

                ], function (err, projects) {
                    // Extract the original doc from each item
                    projects = projects.forEach((item) => { return item.doc });
                })


                results.users = await User.find({
                    $or: [{ username: query }, { wallet: query }, { email: query }]
                }).select(["username","avatar"]);
                if (!results) return false;


                return results
            } catch (err) {
                console.log(err)
                return false
            }
            break;
        case 'edit mint':
            try {
                const updateField = `mint_info.${data.field}`
                project = await Project.findOne({ _id: data.target })
                if (data.hunter !== '62db7736f1d0cb583c84ee3c') {

                    if (project.hunter_id.toString() !== data.hunter) throw new Error(`That's not your project bruh`)
                }
                console.log(project.hunter_id.toString())
                project = await Project.findOneAndUpdate({ _id: project._id }, { [updateField]: data.value }, { new: true })
            } catch (err) {
                console.log(err)
                return false
            }
            break;
        case 'edit project':
            try {
                project = await Project.findOne({ _id: data.target })//.populate({ path: 'hunter_id', model: 'User' })
                if (data.hunter !== '62db7736f1d0cb583c84ee3c') {

                    if (project.hunter_id.toString() !== data.hunter) throw new Error(`That's not your project bruh`)
                }
                project = await Project.findOneAndUpdate({ _id: project._id }, { [data.field]: data.value }, { new: true })
            } catch (err) {
                console.log(err)
                return false
            }
            break;
    }
    return project
}

module.exports = { projectController };