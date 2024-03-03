/*-----------------------*\
 * IMPORT Components
\*-----------------------*/
const app = require("./app");


/*-----------------------*\
 * IMPORT Npm
\*-----------------------*/




// #######################
app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});


