/*-----------------------------------*\
 * ASYNC ERROR HANDLING MIDDLEWARE
\*-----------------------------------*/
const catchAsyncErrors = require('./catchAsyncError');

/*-----------------------------------*\
 * IMPORT ERROR HANDLER
\*-----------------------------------*/
const ErrorHandler = require('../utils/errorHandler');

/*-----------------------------------*\
 * IMPORT USER MODEL
\*-----------------------------------*/
const User = require('../models/userModel');

/*-----------------------------------*\
 * IMPORT JWT
\*-----------------------------------*/
const jwt = require("jsonwebtoken");


exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});


/*-----------------------------------*\
 * ADMIN
\*-----------------------------------*/
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resource`,
                    403
                )
            );
        }

        next();
    };
};