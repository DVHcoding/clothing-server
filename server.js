/*-----------------------*\
 * IMPORT Components
\*-----------------------*/
const app = require("./app");
const connectDatabase = require("./config/database");

/*-----------------------*\
 * IMPORT Npm
\*-----------------------*/




// #######################
connectDatabase();



app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});


