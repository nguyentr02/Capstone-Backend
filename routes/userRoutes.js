const express = require('express');
const router = express.Router();
const { registerUserCont, loginUserCont } = require('../controllers/userController');

// User registration route
router.post('/register', registerUserCont);
router.post('/login', loginUserCont);

module.exports = router;
