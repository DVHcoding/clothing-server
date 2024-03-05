/*-----------------------------------*\
 * IMPORT MODEL
\*-----------------------------------*/
const Product = require('../models/productModel');


/*-----------------------------------*\
 * IMPORT MIDDLEWARE
\*-----------------------------------*/
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');

/*-----------------------------------*\
 * IMPORT API FEATURES
\*-----------------------------------*/
const ApiFeatures = require('../utils/apifeatures')
const cloudinary = require('cloudinary').v2;





/*-----------------------------------*\
 * CREATE PRODUCT -- Admin
\*-----------------------------------*/
exports.createProduct = catchAsyncErrors(
    async (req, res) => {

        req.body.user = req.user.id;

        const product = await Product.create(req.body);

        res.status(201).json(
            {
                success: true,
                product
            }
        );
    }
);


/*-----------------------------------*\
 * GET ALL PRODUCTS 
\*-----------------------------------*/
exports.getAllProducts = catchAsyncErrors(
    async (req, res) => {

        const resultPerPage = 8;
        const productsCount = await Product.countDocuments();

        const apiFeature = new ApiFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage)


        const products = await apiFeature.query;

        res.status(200).json(
            {
                success: true,
                products,
                productsCount,
                resultPerPage,
            }
        );
    }
);


/*-----------------------------------*\
 * GET ALL PRODUCTS --Admin
\*-----------------------------------*/
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});



/*-----------------------------------*\
 * UPDATE PRODUCT -- Admin
\*-----------------------------------*/
exports.updateProduct = catchAsyncErrors(
    async (req, res, next) => {

        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.uploader.destroy(product.images[i].public_id);
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            findOneAndUpdate: false
        });

        res.status(200).json(
            {
                success: true,
                product
            }
        );
    }
);


/*-----------------------------------*\
 * DELETE PRODUCT -- Admin
\*-----------------------------------*/
exports.deleteProduct = catchAsyncErrors(
    async (req, res, next) => {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.uploader.destroy(product.images[i].public_id);
        }

        await product.deleteOne();

        res.status(200).json(
            {
                success: true,
                message: "Product Delete Successfully"
            }
        );

    }
);


/*-----------------------------------*\
 * GET PRODUCT DETAILS 
\*-----------------------------------*/
exports.getProductDetails = catchAsyncErrors(
    async (req, res, next) => {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }

        res.status(200).json({
            success: true,
            product,
        });
    }
);



/*---------------------------------------*\
 * CREATE NEW REVIEW OR UPDATE REVIEW
\*---------------------------------------*/
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    // Checking if the user has already reviewed the product
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    // If the user has already reviewed the product, update the existing review
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
        // If the user hasn't reviewed the product before, add a new review
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // Calculate the average rating of the product
    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.rating = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });

});




/*---------------------------------------*\
 * GET ALL REVIEWS OF PRODUCTS -- Admin 
\*---------------------------------------*/
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});


/*---------------------------------------*\
 * DELETE REVIEW -- Admin 
\*---------------------------------------*/
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    // ###############
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    // ###############
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    // ###############
    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    // ###############
    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    // ###############
    const numOfReviews = reviews.length;


    // ###############
    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    // ###############
    res.status(200).json({
        success: true,
    });
});