const mongoose = require("mongoose");
const User = require("./User");
const Project = mongoose.model("Project");
const Schema = mongoose.Schema;
// const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };


const upvoteSchema = new Schema({
    target: {
        type: Schema.Types.ObjectId,
        ref: "Project",
    },
    voter: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    token: {
        type: String
    }
});

const Upvote = mongoose.model("Upvote", upvoteSchema);
// upvoteSchema.pre('deleteOne', function () {
//     Project.findOneAndUpdate({ _id: this.target }, { $pull: { upvotes: this._id } });
//     const user = User.findOne({ _id: this.voter }).populate({ path: 'favorites', model: 'Project' })
//     user.favorites.findOne({ _id: this.target }, { $pull: { upvotes: this.target } }, { new: true })
//     console.log('PreRemove Hook Called \n \n Removing ' + this._id + ' from Project List')
// })
module.exports = Upvote;
