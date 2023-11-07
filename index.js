const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt =require("jsonwebtoken")
var cookieParser = require('cookie-parser')
require('dotenv').config();
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vjcdyry.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const booksCollection =client.db("Book-Hub").collection('post-books')
    const categoryCollection =client.db("Book-Hub").collection('category')
    

    const verify =(req,res)=>{
     const {token} = req.cookies;
     console.log(token)

     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET , function(err, decoded) {
      
      });

   
    }



    app.post('/jwt', async(req,res)=>{
        const user= req.body;
        console.log("user token", user)
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
        res.cookie('token',token,{
            httpOnly: true,
            secure: false,
            sameSite: 'none'
        }).send({success: true})
    })
// books post 
    app.post('/postbooks',async(req,res)=>{
        const books = req.body;
        console.log(books)
        const result= await booksCollection.insertOne(books);
        console.log(result)
        res.send(result);
    })
    // get category

    app.get('/getcategory',verify, async(req,res)=>{
        const cursor = categoryCollection.find();
        const user = await cursor.toArray()
        res.send(user)
       })

    // get books

    app.get('/getbooks', async(req,res)=>{
     const cursor = booksCollection.find();
     const user = await cursor.toArray()
     res.send(user)
    })








    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get("/",(req,res)=>{
    res.send("conffee serverr is running")
})


app.listen(port, ()=>{
    console.log(`coffee server is running on port${port}`)
})