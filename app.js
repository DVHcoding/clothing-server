/*-----------------------*\
 * IMPORT Components
\*-----------------------*/
const errorMiddleware = require("./middleware/error");
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');


/*-----------------------*\
 * IMPORT Npm
\*-----------------------*/
const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
app.use(cors());

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

/*-----------------------------------*\
 * APPLY ERROR HANDLING MIDDLEWARE
\*-----------------------------------*/
app.use(errorMiddleware)


module.exports = app;