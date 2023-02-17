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
        res.send({ message: 'pattern setup successfully created', data: setup._id});
    } catch(error) {
        next(error);
    }
};

// Edit setup
async function editSetup(req, res, next) {
    try {
        await Setup.findByIdAndUpdate(req.params.setupID, req.body);
        let update = await Setup.findById(req.params.setupID);
        res.send({ message: 'pattern setup successfully updated', data: update });
    } catch(error) {
        next(error);
    }
};

// Delete setup
async function deleteSetup(req, res, next) {
    try {
        let deleted = await Setup.findByIdAndDelete(req.params.setupID);
        if(!deleted) throw new Error('no pattern found, could not be deleted');
        res.send({ message: 'pattern setup successfully deleted'});
    } catch(error) {
        next(error);
    }
};

// Get All Setups
async function getAllSetups(req, res, next) {
    try {
        let setups = await Setup.find();
        if(setups) res.send({ message: 'pattern setups successfully retrieved', data: setups });
        else res.send({ message: 'no pattern setups found', data: [] });
    } catch(error) {
        next(error);
    }
};

module.exports = { getSetup, newSetup, editSetup, deleteSetup, getAllSetups };