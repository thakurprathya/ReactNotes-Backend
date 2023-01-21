const express= require("express");
const router= express.Router();
const Note= require("../models/Note");  //importing Note model
var fetchuser= require("../middleware/fetchuser");  //importing our middleware used in 3rd route
const { body, validationResult } = require("express-validator");  //importing package express-validator for validating user info    

//Route1; Fetching all Notes
//using GET; with endpoint "/notes/fetchallnotes"  login required
router.get("/fetchallnotes", fetchuser, async (req, res)=>{
    try{
        const notes= await Note.find({user: req.user.id});  //fetchuser updates req.user if exists
        res.json(notes);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route2; Adding New Note
//using POST; with endpoint "/notes/addnote"  login required
router.post("/addnote", fetchuser, [
    //adding validations using express validator package and validating title, description
    body("title", "Invalid Title, should be of minLength:3").isLength({min: 3}),
    body("description", "Description too short, needs to be of minLength:5").isLength({min: 5})
], 
async (req, res)=>{
    try{
        const {title, description, tag, date}= req.body;
        const errors = validationResult(req);  //checking validations declared above and storing result
        if (!errors.isEmpty()){ return res.status(400).json({ errors: errors.array() }); }
        const note= new Note({
            title, description, tag, date, user: req.user.id
        });
        const savedNote= await note.save();
        res.json(savedNote);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route3; Updating a Existing Note
//using PUT; with endpoint "/notes/updatenote/:id"  login required, also adding id as updation needs to be user specific
router.put("/updatenote/:id", fetchuser, async (req, res)=>{
    try{
        const {title, description, tag}= req.body;
        const newNote={};  //creating a newnote object
        if(title){ newNote.title= title;}  //if recieved title from req.body
        if(description){ newNote.description= description;}  //if recieved description from req.body
        if(tag){ newNote.tag= tag;}  //if recieved tag from req.body

        //finding the note for updation and updating it
        let note= await Note.findById(req.params.id);  //await as asynchronous
        if(!note){ return res.status(404).send("Note not Found!"); } //if note does not exists
        if(note.user.toString() !== req.user.id){ return res.status(401).send("Invalid Operation, Not Allowed"); } //validating if note is of particular user or not
        note= await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});
        res.json({note});

    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route4; Deleting a Note
//using DELETE; with endpoint "/notes/deletenote/:id"  login required also adding id as deletion needs to be user specific
router.delete("/deletenote/:id", fetchuser, async (req, res)=>{
    try{
        //finding the note for deletion and delete it
        let note= await Note.findById(req.params.id);  //await as asynchronous
        if(!note){ return res.status(404).send("Note not Found!"); } //if note does not exists
        if(note.user.toString() !== req.user.id){ return res.status(401).send("Invalid Operation, Not Allowed"); } //validating if note is of particular user or not
        note= await Note.findByIdAndDelete(req.params.id);
        res.json({"Success :": "Note deleted successfully", note: note});

    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports= router;