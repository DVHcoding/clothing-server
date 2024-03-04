/*-----------------------------------*\
 * IMPORT Components
\*-----------------------------------*/
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');

/*-----------------------------------*\
* IMPORT Npm
\*-----------------------------------*/
const crypto = require("crypto");
const cloudinary = require('cloudinary').v2;



/*-----------------------------------*\
 * REGISTER A USER
\*-----------------------------------*/
exports.registerUser = catchAsyncErrors(
    async (req, res, next) => {

        const { name, email, password, public_id, url } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: public_id,
                url: url,
            },
        });

        sendToken(user, 201, res);
    }
);



/*-----------------------------------*\
 * LOGIN USER
\*-----------------------------------*/
exports.loginUser = catchAsyncErrors(
    async (req, res, next) => {
        const { email, password } = req.body;

        // checking if user has given password and email both

        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        sendToken(user, 200, res);
    }
);


/*-----------------------------------*\
 * LOGOUT USER
\*-----------------------------------*/
exports.logout = catchAsyncErrors(
    async (req, res, next) => {

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        res.status(200).json(
            {
                success: true,
                message: "Logged Out"
            }
        );
    }
);



/*-----------------------------------*\
 * FORGOT PASSWORD
\*-----------------------------------*/
exports.forgotPassword = catchAsyncErrors(
    async (req, res, next) => {

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Get ResetPassword Token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email 
        then please ignore it`;

        try {

            await sendEmail({
                email: user.email,
                subject: "Ecommerce Password Recovery",
                message,
            });

            res.status(200).json(
                {
                    success: true,
                    message: `Email sent to ${user.email} successfully`,
                }
            );

        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return next(new ErrorHandler(error.message, 500));
        }
    }
);


/*-----------------------------------*\
 * RESET PASSWORD
\*-----------------------------------*/
exports.resetPassword = catchAsyncErrors(
    async (req, res, next) => {

        // creating token hash
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return next(
                new ErrorHandler(
                    "Reset Password Token is invalid or has been expired",
                    400
                )
            );
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not password", 400));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendToken(user, 200, res);
    }
);



/*-----------------------------------*\
 * UPDATE PASSWORD 
\*-----------------------------------*/
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});



/*-----------------------------------*\
 * GET USER DETAILS
\*-----------------------------------*/
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});



/*-----------------------------------*\
 * UPDATE PROFILE
\*-----------------------------------*/
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        avatar: {
            public_id: req.body.avatar.public_id,
            url: req.body.avatar.url,
        }
    };

    if (req.body.old_public_id) {
        await cloudinary.uploader.destroy(req.body.old_public_id);
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});



/*-----------------------------------*\
 * GET ALL USERS -- Admin
\*-----------------------------------*/
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});



/*-----------------------------------*\
 * GET SINGLE USER -- Admin
\*-----------------------------------*/
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        user,
    });
});



/*-----------------------------------*\
 * UPDATE USER ROLE -- Admin
\*-----------------------------------*/
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    let user = User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400));
    }

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});


/*-----------------------------------*\
 * DELETE USER -- Admin
\*-----------------------------------*/
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
    }

    const imageId = user.avatar.public_id;

    await cloudinary.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});