const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
  .route('/me')
  .get(protect, userController.getMe)
  .patch(protect, userController.updateMe);

router.route('/').get(protect, userController.getAllUsers);

router
  .route('/:id')
  .get(protect, userController.getUser)
  .delete(protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
