const express = require('express');
const { serveSetup } = require('../middleware/pageMiddleware');
const { getSetup, newSetup, editSetup } = require('../controllers/setupController');
const router = express.Router();

router.route('/').get(serveSetup).post(newSetup);
router.route('/data/:setupID').get(getSetup).put(editSetup);

module.exports = router;