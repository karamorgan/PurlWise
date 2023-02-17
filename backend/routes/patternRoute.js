const express = require('express');
const { tree } = require('../controllers/patternController');
const { servePattern } = require('../middleware/pageMiddleware');
const router = express.Router();

router.route('/:setupID').get(servePattern);
router.route('/display/:setupID').get(tree.getBuildDisplays);
router.route('/data/:setupID/:patternID?').get(tree.getData).delete(tree.delete);
router.route('/add/:setupID').post(tree.add);
router.route('/split/:setupID').post(tree.split);

module.exports = router;