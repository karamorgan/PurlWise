// All register/login/user code is on hold for a future update
// Will include user authentication and a separate collection on the database to store user info
// Need to look into security risks before implementing this

const express = require('express');
const router = express.Router();
const { serveRegister, serveLogin } = require('../middleware/pageMiddleware');
const { newUser, loginUser, getMe } = require('../controllers/userController');

router.route('/').get(serveRegister).post(newUser);
// router.post('/login', loginUser);
// router.get('/me', getMe);

module.exports = router;