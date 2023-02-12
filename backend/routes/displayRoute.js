const express = require('express');
const { serveDisplay } = require('../middleware/pageMiddleware');
// const { } = require('../controllers/displayController');
const router = express.Router();

router.route('/:setupID').get(serveDisplay);

module.exports = router;