const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const catchAsync = require('../helpers/catchAsync');
const AppError = require('../helpers/appError');
const {
  signUpValidation,
  loginValidation,
} = require('../validations/userValidations');
const User = require('../models/User');
const oauth2Client = require('../../googleapi');

const YOUR_CLIENT_ID = process.env.YOUR_CLIENT_ID;
const YOUR_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET;
const YOUR_REFRESH_TOKEN = process.env.YOUR_REFRESH_TOKEN;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // payload + secret + expire time
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createsendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove the password from output
  let resUser = user.toObject();
  resUser.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user: resUser,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const validate = signUpValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }

  const accessToken = oauth2Client.getAccessToken()

  console.log(req.body)
  let user = await User.create(req.body);


  let transport = await nodemailer.createTransport({
    service:'gmail',
    auth:{
      type:'OAuth2',
      user:'cs1812218@szabist.pk',
      clientId: YOUR_CLIENT_ID,
      clientSecret: YOUR_CLIENT_SECRET,
      refreshToken: YOUR_REFRESH_TOKEN,
      accessToken: accessToken
    }
  });

  let mailOptions = {
    from: '"Checking"', // sender address
    to: req.body.email, // list of receivers
    subject: "Credentials for your Portal", // Subject line
    text: "Hello world?", // plain text body
    html: `<p><Congratulations on your recruitment, here’s the access to the portal./p><br><p>Email: ${req.body.email} and Password: ${req.body.password}</p>`, // html body
  };

  const result = await transport.sendMail(mailOptions)
  console.log(result)

  res.status(201).json({
    status: 'success',
    user,
  });

});

exports.login = catchAsync(async (req, res, next) => {
  const validate = loginValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }
  const { email, password } = req.body;
  if (!email || !password) {
    //  check email and password exist
    return next(new AppError(' please proveide email and password ', 400));
  }
  const user = await User.findOne({ email }).select('+password'); // select expiclity password
  if (!user)
    return next(new AppError(`No User found against email ${email}`, 404));

  console.log(`user.role`, user.role);

  if (
    !user || // check user exist and password correct
    !(await user.correctPassword(password, user.password))
  ) {
    // candinate password,correctpassword
    return next(new AppError('incorrect email or password', 401));
  }
  createsendToken(user, 200, res);
});
