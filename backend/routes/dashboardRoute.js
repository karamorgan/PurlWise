const express = require('express');
const router = express.Router();
const { serveDashboard } = require('../middleware/pageMiddleware');

router.route('/').get(serveDashboard);

module.exports = router;