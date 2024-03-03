/*-----------------------*\
 * IMPORT Components
\*-----------------------*/

/*-----------------------*\
 * IMPORT Npm
\*-----------------------*/
const express = require("express");
const app = express();
// ################################
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
// #######################


// #######################
app.use(cors());

module.exports = app;