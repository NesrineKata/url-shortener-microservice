require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const shortId =require("shortid");
const validURL =require("valid-url");
var bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const mongoose=require("mongoose");
const uri_mongo = process.env.MONGO_URI;
const client = new MongoClient(uri_mongo, 
{ useNewUrlParser: true, 
useUnifiedTopology: true });

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
client.once('open',()=>{
console.log("MongoDb  databse  connection established successfully");
});
const Schema=mongoose.Schema;
const urlSchema=new Schema({
  original_url:String,
  short_url:String
});
const URL =mongoose.model("URL",urlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ entended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/new',async function(req, res) {
   const url=req.body.url;
   const urlcode=shortId.generate();
   if(!validURL.isUri(url)){
     res.status(401).json({
       error:'invalid URL'
     });
   }else{
     try{
       let findOne=await URL.findOne({
          original_url:url
       })
       if(findOne){
         res.json({original_url:findOne.original_url,shor_ulr:findOne.short_url});
       }else{
        findOne=new URL({
            original_url:url,
            short_ulr:urlcode
        }) 
        await findOne.save();
         res.json({original_url:findOne.original_url,shor_ulr:findOne.short_url});
       }

     }catch(err){
       console.error(err);
       res.status(500).json("server error");
     }
   }


  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
