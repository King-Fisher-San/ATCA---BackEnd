const User = require('../models/User');

const catchAsync = require('../helpers/catchAsync');
const { updateValidation } = require('../validations/userValidations');
const AppError = require('../helpers/appError');

// admin
exports.getAllUsers = catchAsync(async (req, res) => {
  let query = User.find();
  if (req.query.role) query.find({ role: req.query.role });
  const users = await query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const validate = updateValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedUser)
    return next(new AppError(`Can't find any user with id ${userId}`, 404));

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

// admin only

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser)
    return next(new AppError(`No User found against id ${userId}`, 404));

  res.status(200).json({
    status: 'success',
    user: deletedUser,
  });
});
