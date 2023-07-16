const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
// const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };


const userSchema = new Schema({
    generic_token:{
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    avatar: String,
    bio: String,
    wallet: {
        type: String,
        // minLength: 44,
        maxLength: 44,
        // unique: true,
    },
    tokens:{
        type:Array,
    },
    twitter: {
        type: String,
    },
    discord: {
        type: String,
    },
    discordID: {
        type: String,
    },
    website: {
        type: String,
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Projects'
    }],
    password: {
        type: String,
        required: true,
    },
    lastOnline: {
        type: Number,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    isHolder: {
        type: Boolean,
        default: false,
        index: true
    },
    ERT:{
        type: String,
        unique: true,
    }


})//opts)

// hash user password
userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
    // return password === this.password
    return bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", userSchema);

module.exports = User;