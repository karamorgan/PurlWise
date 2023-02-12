const Setup = require('../models/setupModel');

// Serve dashboard
function serveDashboard(req, res) {
    res.sendFile('dashboard.html', { root: 'public/html' });
};

// Serve register page
function serveRegister(req, res) {
    res.sendFile('register.html', { root: 'public/html' });
};

// Serve login page
function serveLogin(req, res) {
    res.sendFile('login.html', { root: 'public/html' });
};

// Serve setup page
function serveSetup(req, res) {
    res.sendFile('setup.html', { root: 'public/html' });
};

// Serve pattern page
async function servePattern(req, res, next) {
    try {
        const setupID = req.params.setupID;
        const findPattern = await Setup.findOne({ setupID });
	    if(!findPattern) throw new Error('No pattern found');
	    res.sendFile('pattern.html', { root: 'public/html' });
    } catch (error) {
	    next(error);
    }
};

// Serve Setup display page
async function serveDisplay(req, res, next) {
    try {
        const setupID = req.params.setupID;
        const findPattern = await Setup.findOne({ setupID });
	    if(!findPattern) throw new Error('No pattern found');
        res.sendFile('display.html', { root: 'public/html' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    serveDashboard,
    serveRegister,
    serveLogin,
    serveSetup,
    servePattern,
    serveDisplay
};