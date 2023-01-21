const mongoose= require("mongoose");

const connectToMongo = (url)=>{
    mongoose.set("strictQuery", false);  //for removing deprecation warning
    mongoose.connect(url , 
        { useNewUrlParser: true, useUnifiedTopology: true },
        ()=>{  console.log(`Connected with database Successfuly`); })
}

module.exports= connectToMongo;