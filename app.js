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
// const allowedOrigin = 'https://clothing-store-web.vercel.app';
// // app.use(cors({
// //     origin: allowedOrigin
// // }));

app.use(cors({
    origin: 'https://learnlangs.online',
    credentials: true // Bật chia sẻ cookie qua CORS
}));

app.set("trust proxy", 1);

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");


// #######################
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


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