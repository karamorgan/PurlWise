const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: false
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: false
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
