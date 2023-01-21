const mongoose= require("mongoose");

//copying a schema from mongoose site https://mongoosejs.com/docs/guide.html
const NotesSchema = new mongoose.Schema({
    user:{ type:mongoose.Schema.Types.ObjectId, ref:"user" },  //here type is like a foreign key(linking with particular user), and ref is reference model, this same model is needed to be used at the time of creating model in UserSchema
    title:{ type:String, required:true },   //setting its type string and setting as mandatory (one way of setting type)
    description:{ type:String, required:true },
    tag:{ type:String, default:"General" }, //setting default value
    date:{ type:Date, default:Date.now }
})

const Note= mongoose.model("note", NotesSchema);  //model requires a modelname (user here) & type (schema here)
// Notes.createIndexes();  //will help in maintaining duplicate data or we have to additionaly code
module.exports= Note;