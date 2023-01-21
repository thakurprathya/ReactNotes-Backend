require("dotenv").config();
const jwt= require("jsonwebtoken");  //importing jsonwebtoken package for authenticating user

const fetchuser= (req, res, next)=>{
    //geting the user from jwt token & add id to request object
    const token= req.header("auth-token");  //fetching token from request's header
    if(!token){ res.status(401).send({error: "Invalid Authentication Token"}); }
    try{
        const data= jwt.verify(token, process.env.JWT_SECRET);  //second parameter is our secret code also passed during login, idealy should be included as env variable
        req.user= data.user;
        next(); //this calling will help in running the next function which is called after it or declared
    }catch(error){
        res.status(401).send({error: "Invalid Authentication Token"});
    }
}
module.exports= fetchuser;