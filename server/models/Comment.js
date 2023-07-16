const mongoose = require("mongoose");

const Schema = mongoose.Schema;
// const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };


const commentSchema = new Schema({
    target: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    timestamp: Date
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
