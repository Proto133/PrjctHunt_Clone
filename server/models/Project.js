const mongoose = require("mongoose");
const User = require("./User");

const Schema = mongoose.Schema;
// const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };


const projectSchema = new Schema({
    index: { type: Number, index: false },
    hunter: {
        type: String,
        required: true,
        // index:true
    },//Token_ID
    hunter_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
        // index:true,
    },
    tagline: {
        type: String,
        required: true,
        // index:true,
    },
    summary: {
        type: String,
        required: true,
        // index:true,
    },
    thumbnail: String,
    media: Array,
    tags: Array,
    mint_info: {
        mintingNow: Boolean,
        url: String,
        minted: Boolean,
        date: String,
        price: Number,
        price_TBA: Boolean
    },
    size: Number,
    twitter: String,
    discord: String,
    website: String,
    hunted_date: String,
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'Upvotes'
    }],
    sponsored: {
        isSponsored: {
            type: Boolean,
            default: false
        },
        amount: { type: Number, default: null },
        dates: {
            start: {
                type: Date, default: null
            },
            end: {
                type: Date, default: null
            }
        },
        multiplier: { type: Number, default: 1 },
        sig: [{
            type: String,
        }]
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comments'
    }]
})

projectSchema.set('autoIndex', true)
const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
