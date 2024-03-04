/*-----------------------*\
 * IMPORT Components
\*-----------------------*/
const errorMiddleware = require("./middleware/error");
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require("./routes/orderRoute");
const stripe = require("./routes/stripe");

/*-----------------------*\
 * IMPORT Npm
\*-----------------------*/
const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");

const allowedOrigins = ['https://clothing-store-web.vercel.app', 'http://192.168.43.159:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Kiểm tra xem origin có trong danh sách allowedOrigins hay không. Nếu có, cho phép.
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            // Nếu không, trả về lỗi CORS.
            callback(new Error('Not allowed by CORS'));
        }
    }
}));


const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");


// #######################
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


/*-----------------------------------*\
 * API
\*-----------------------------------*/
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use('/api/v1', order);
app.use("/api/v1/stripe", stripe);

/*-----------------------------------*\
 * APPLY ERROR HANDLING MIDDLEWARE
\*-----------------------------------*/
app.use(errorMiddleware)


module.exports = app;