const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../model/userModel');
const Email = require('../utils/email');
const crypto = require('crypto');
const { decode } = require('punycode');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };
  if (process.env.NODE_ENV === 'development') cookieOptions.secure = false;
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions).status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;

  // console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, req, res);
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   user: newUser,
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password  exist

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email: email }).select('+password');
  // 2) Check if user exist and password is correct

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect Email or password', 401));

  // 3) If everything is okay, send the json web token back to client

  createSendToken(user, 200, req, res);
  // const token = signToken(user._id);
  // console.log(user);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});
exports.logout = (req, res, next) => {
  res
    .cookie('jwt', 'loggedOut', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .status(200)
    .json({
      status: 'success',
    });
};

exports.protect = catchAsync(async function (req, res, next) {
  // 1) Getting the token and check if it;s there: i.e if it exist
  let token;
  if (
    // req.headers.authorization &&
    req.headers.authorization?.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  // 2)  Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const currentUser = await User.findById(decoded.id).select('+password');
  if (!currentUser) return next(new AppError('The user no longer exists'), 401);
  // 4) Check if user changed password after the token was issued

  if (currentUser.changePasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  // GRant access to protected Route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages and no error
exports.isLoggdIn = async function (req, res, next) {
  // 1) Getting the token and check if it;s there: i.e if it exist
  try {
    if (req.cookies?.jwt) {
      // 2)  Verifying token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exist
      const currentUser = await User.findById(decoded.id).select('+password');
      if (!currentUser) return next();
      // 4) Check if user changed password after the token was issued

      if (currentUser.changePasswordAfter(decoded.iat)) return next();
      // There is a logged in user (EAch and every pug template would have access to a pug template)
      // res.locals.user = currentUser;
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array
    // 403 means forbidden
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `Sorry! You don't have permission to perform this action`,
          403
        )
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) GEt user based on Posted email

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('There is no user with the email address', 404));

  // 2) Generate a random reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email

  try {
    const resetURL =
      process.env.NODE_ENV === 'development'
        ? `${req.protocol}://${req.get(
            'host'
          )}/api/v1/users/resetPassword/${resetToken}`
        : `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    userPasswordResetExipres = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!. Thanks for using our service.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  // 2) If token has not expired, and there is a user, set new password

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // 3) update the changedPasswordAt property for the user

  // 3b) Send Email notification
  await new Email(
    user,
    'https://api.whatsapp.com/send/?phone=2348091170198&text&app_absent=0'
  ).sendPasswordResetNotification();

  // 4) Log the user in, and send JWT
  createSendToken(user, 200, req, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from collection
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  // let token;
  // if (req.headers.authorization?.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ').at(1);
  //   console.log(token, 'line 208');
  // }

  // if (!token)
  //   return next(
  //     new AppError('You are not logged in!! Please try forgot password', 401)
  //   );

  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // const user = await User.findById({ _id: decoded.id }).select('+password');
  const user = await User.findById(req.user.id).select('+password');

  if (!user)
    return next(
      new AppError(
        'User not found! Please log in again or reset your password.'
      ),
      401
    );

  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(oldPassword, user.password)))
    return next(
      new AppError('Current Password is incorrect, Please try again!', 401)
    );
  if (newPassword !== newPasswordConfirm)
    return next(
      new AppError(
        'New password to be corrected do not match please check and try again!'
      ),
      401
    );

  // 3) If so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  // User.findByIdAndUpdate would not work because of two reason basically
  await user.save();
  // 4) log user in, send jwt
  createSendToken(user, 200, req, res);
  // const newToken = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   newToken,
  //   user,
  // });
});
