// All register/login/user code is on hold for a future update
// Will include user authentication and a separate collection on the database to store user info
// Need to look into security risks before implementing this

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function newUser(req, res, next) {
    try {
        const { username, email, password } = req.body;

        if(!username || !email || !password) {
            res.status(400);
            throw new Error('Please enter all required fields');
        }
        if(await User.findOne({ username })) {
            res.status(400);
            throw new Error('username already exists');
        }
        if(await User.findOne({ email })) {
            res.status(400);
            throw new Error('email already exists');
        }

        console.log(await User.create(req.body));

        res.redirect('/dashboard');
    } catch(err) {
        return next(err);
    }
};

async function loginUser(req, res) {
    res.json({message: 'login user'});
};

async function getMe(req, res) {
    res.json({message: 'user data'});
};

module.exports = { newUser, loginUser, getMe };