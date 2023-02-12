const Setup = require('../models/setupModel');

// Get Setup
async function getSetup(req, res, next) {
    try {
        let setup = await Setup.findById(req.params.setupID);
        res.send({ message: 'successfully retrieved pattern setup', data: setup});
    } catch (error) {
        next(error);
    }
};

// New Setup
async function newSetup(req, res, next) {
    try {
        if(!req.body.name) {
            res.status(400);
            throw new Error('Please enter a setup name')
        };
        const setup = await Setup.create(req.body);
        res.redirect(`/pattern/${setup._id}`);
    } catch(err) {
        next(err);
    }
};

// Edit setup
async function editSetup(req, res, next) {
    try {
        let update = await Setup.findByIdAndUpdate(req.params.setupID, req.body);
        res.send({ message: 'setup successfully updated', data: update });
    } catch(err) {
        next(err);
    }
}

// Delete setup--coming soon in future update
async function deleteSetup() {
}

module.exports = { getSetup, newSetup, editSetup, deleteSetup };