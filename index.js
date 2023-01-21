const connectToMongo = require("./connection");
require("dotenv").config();
const express= require("express");
const app= express();
// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');


//middlewares
app.use(express.json())  //if we donot use it we won't have data in req.body
//Security middlewares
app.use(
    rateLimiter({ 
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    })
);// this library is used to limit the amount of requests user can make
app.use(helmet());  //most popular security package sets various https headers to prevent attacks
app.use(cors());  //it ensures that api accessable from diff domains (without using it only can access api in project domain only like public directory), corss basically makes api public
app.use(xss());  //xss-clean library sanitizes the user input in req.body, req.query, req.params, protects us from cross-site attacks

//Available routes
app.get("/",(req, res)=>{  res.json("Connection successful, Server started!!") }); //sample response for / page
app.use("/auth", require("./routes/auth"));  //setting route with endpoint /auth visible at http://localhost:${port}/auth
app.use("/notes", require("./routes/notes")); //setting route with endpoint /notes

//setting up port for server
const port= process.env.PORT || 4000;

//connecting to database
const start = async () => {
    try {
        await connectToMongo(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server is listening on port ${port}...`) );
    } catch (error) {
        console.log(error);
    }
};
start();