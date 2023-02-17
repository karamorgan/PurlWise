const express = require('express');
const { serveSetup } = require('../middleware/pageMiddleware');
const { getSetup, newSetup, editSetup, deleteSetup, getAllSetups } = require('../controllers/setupController');
const router = express.Router();

router.route('/').get(serveSetup).post(newSetup);
router.route('/data/:setupID').get(getSetup).put(editSetup).delete(deleteSetup);
router.route('/all').get(getAllSetups);

module.exports = router;