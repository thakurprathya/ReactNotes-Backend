const mongoose= require("mongoose");

//copying a schema from mongoose site https://mongoosejs.com/docs/guide.html
const UserSchema = new mongoose.Schema({
    username:{ type:String, required:true, unique:true },   //setting its type string and setting as mandatory (one way of setting type)
    name: String,  //another way of setting type
    email:{ type:String, required:true, unique:true },
    password:{ type:String, required:true }
})

const User= mongoose.model("user", UserSchema);  //model requires a modelname (user here) & type (schema here)
// User.createIndexes();  //will help in maintaining duplicate data or we have to additionaly code
module.exports= User;