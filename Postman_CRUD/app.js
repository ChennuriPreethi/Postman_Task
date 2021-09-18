var express = require('express')
var app = express()

app.use(express.urlencoded({extended: true}))
app.use(express.json());

var path = require("path")
const multer = require('multer')

const {MongoClient, ObjectId}  = require('mongodb');

app.use(express.static('uploads'));

const url = 'mongodb://127.0.0.1:27017';
const dbname = "Preethi";

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
      cb(null,__dirname+ '/uploads')
    },
    filename: function (req,file,cb) {
      console.log("File in filename function:",file);
      var filetext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+filetext)
    }
  })

const upload = multer({storage:storage})

app.get("/",function(req,res){
    res.send("Hello")
})


//READ


app.get("/stds",function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db = conn.db("Preethi")
        db.collection("Students").find()
        .toArray(function(err,data){
            res.send(data);
        })
    })
})

app.get("/stds/:id",(req,res)=>{
    MongoClient.connect(url,function(err,conn){
        var db=conn.db("Preethi")
        db.collection("Students").find({_id:ObjectId(req.params.id)}).toArray((err,data)=>{
            res.send(data)
        })
    })
})


//CREATE


app.post("/reg",upload.single("pic"),function(req,res){
    console.log(req.body);
    console.log(req.file);
    req.body.profilepic=req.file.filename
    MongoClient.connect(url,function(err,con){
        var db = con.db("Preethi")
        db.collection("Students").insertOne(req.body,function(err,data){
            console.log(data);
            res.send("success")
        })
    })
})


//UPDATE


app.patch("/updatecontact/:id",upload.single("pic"),function(req,res){
    //req.body.pic = req.file.filename;
    MongoClient.connect(url,function(err,conn){
        console.log(req.body)
        var db = conn.db("Preethi");
        db.collection("Students")
        .updateOne({_id:ObjectId(req.params.id)},
        {$set:req.body},
        function(err,data){
            res.send(data)
            //res.send("Updated")
            }
        )
    })
})


//DELETE


app.delete("/delete/:id",upload.single("pic"),function(req,res){
    MongoClient.connect(url,function(err,conn){
        var db = conn.db("Preethi");
        db.collection("Students")
        .findOneAndDelete({_id:ObjectId(req.params.id)},
        {$set:req.body},
        function(err,data){
            res.send(data)
            }
        )
    })
})



app.listen(9000,function(){
    console.log("Running on 9000");
})