const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.post('/signUp', protect, restrictTo('admin'), authController.signup);
router.post('/logIn', authController.login);

module.exports = router;
