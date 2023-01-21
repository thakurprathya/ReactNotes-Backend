const express= require("express");
require("dotenv").config(); //including dotenv package will help in loading environment data into process.env
const { body, validationResult } = require("express-validator");  //importing package express-validator for validating user info    
const router= express.Router();
const User= require("../models/User");  //importing User model
const bcrypt= require("bcryptjs");  //importing bcryptjs pacakge for decrypting password in database
const jwt= require("jsonwebtoken");  //importing jsonwebtoken package for authenticating user
var fetchuser= require("../middleware/fetchuser");  //importing our middleware used in 3rd route

//await is used wherever we have to wait till a promise is resolved

//Route1; signup request
//create a user using: POST with endpoint "/auth/createuser"  which do not requires authentication/login
router.post("/createuser", [
    //adding validations using express validator package and validating username, email, password
    body("username", "Invalid Username, should be unique and minLength:5").isLength({min: 5}),
    body("email", "Invalid Email, should be non-empty & in proper format").isEmail(),
    body("password", "Invalid Pass, should be of minLength:5").isLength({min: 5})
], 
async (req, res)=>{  //for post request send on endpoint /auth/createuser
    let success= false;
    const errors = validationResult(req);  //checking validations declared above and storing result
    if (!errors.isEmpty()){ return res.status(400).json({ success, errors: errors.array() }); }
    //checking whether username and email exists already or not
    try{
        let user= await User.findOne({username: req.body.username});  //using findone funct which search for user with this username in database
        if(user){ return res.status(400).json({success, error: "This username already exists, try another or try login"});}
        user= await User.findOne({email: req.body.email});  //using findone funct which search for user with this email in database
        if(user){ return res.status(400).json({success, error: "This email already exists, try another or try login"});}
        //securing the password using bcrypt package functions
        const salt= await bcrypt.genSalt(10);  //this function will generate a salt, using await as returns a promise
        const SecurePass= await bcrypt.hash(req.body.password, salt);  //creating a secure pass using hash and salt, using await as will return a promise
        user= await User.create({ //creating a new user
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: SecurePass,
        });
        //creating a token and signing it using inbuilt funct of package jsobwebtoken
        const data={
            user: {id: user.id}
        };
        const authtoken= jwt.sign(data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
        success=true;
        res.json({success, authtoken}); //returning a token, we can also return direct user to it but for authentication we require token
    }catch(error){  //if some error occur in try block catch block will execute
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }   
})

//Route2; login request
//Authenticating the user using: POST with endpoint "/auth/login"
router.post("/login", [
    //adding validations using express validator package and validating email
    body("email", "Invalid Email, should be non-empty & in proper format").isEmail(),
    body("password", "Password cannot be empty").exists()
], 
async (req, res)=>{
    let success= false;
    const errors = validationResult(req);  //checking validations declared above and storing result
    if (!errors.isEmpty()){ return res.status(400).json({ success, errors: errors.array() }); }
    //destructuring email, pass
    const {email, password}= req.body;
    try{
       let user= await User.findOne({email});  //searching inputed email asynchronously
       const passwordCompare= await bcrypt.compare(password, user.password);  //this function will internally match all the hashes, asynchronous func so using await
       if(!user || !passwordCompare){ success=false; return res.status(400).json({success, error: "Invalid Credentials"}); } 
       const payload={  //its userdata which we will send if no error occured
            user: {id: user.id}
       }
       //second parameter is a secret string it could be anything, idealy we should be including it using env variable but here hardcoding only, sign is a synchronous funct so no need of async await
       const authtoken= jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
       success=true;
       res.json({success, authtoken}); //sending token
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route3; getting user details after user is logged using:  POST with endpoint "/auth/getuser"  Login Required
//for getting the user we have to get the id from authentication token(id is included in token), for which we will be 
//sending a header to all files requiring to authenticate user, and from that header we will fetch data and use here
//one more thing if we directly add id retrieving code here in below block, for a scaleable site, we can need this information
//multiple times so it is better to use a middleware(a function which is called everytime whenever a request is send to
//login required roots) than copying same code at multiple places, we generally creates middleware in main folder
//middleware is a nodejs concept
router.post("/getuser", fetchuser, async (req, res)=>{ //passing middleware fetchuser
    try{
        const userID= req.user.id;
        const user= await User.findById(userID).select("-password"); //selecting all things except the password
        res.send(user);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports= router;