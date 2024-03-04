/*-----------------------*\
 * IMPORT Components
\*-----------------------*/
const app = require("./app");
const connectDatabase = require("./config/database");

/*-----------------------*\
 * IMPORT Npm
\*-----------------------*/
const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");
dotenv.config();



// #######################
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


/*-----------------------------------*\
 * RUN SERVER
\*-----------------------------------*/
const server = app.listen(process.env.PORT, (req, res) => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

/*-----------------------------------*\
 * HANDLING UNCAUGHT EXCEPTION 
\*-----------------------------------*/
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Uncaught Exception');

    server.close(() => {
        process.exit(1);
    });
});


/*-----------------------------------*\
 * UNHANDLED PROMISE REJECTION
\*-----------------------------------*/
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled Promise Rejection');

    server.close(() => {
        process.exit(1)
    });
});

