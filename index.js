const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken")
var cookieParser = require('cookie-parser')
require('dotenv').config();
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());




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

        const booksCollection = client.db("Book-Hub").collection('post-books')
        const categoryCollection = client.db("Book-Hub").collection('category')
        const wishListCollection = client.db("Book-Hub").collection('wishlist')
        const subscriberCollection = client.db("Book-Hub").collection('subscribe')


        const verify = (req, res, next) => {
            const { token } = req.cookies;
            //  console.log(token)

            //  if client does not send token
            if (!token) {
                return res.status(401).send({ message: 'You are not authorized' })
            }

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: 'You are not authorized' })
                }
                //   console.log(decoded)
                req.user = decoded;
                next()
            });


        }



        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log("user token", user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).send({ success: true })
        });



        
        // books post 
        app.post('/postbooks', async (req, res) => {
            const books = req.body;
            console.log(books)
            const result = await booksCollection.insertOne(books);
            console.log(result)
            res.send(result);
        });





        // books post wishlist
        app.post('/wishlist', async (req, res) => {
            const books = req.body;
            const result = await wishListCollection.insertOne(books);
            res.send(result);
        });





        // Newsletter subscribe
        app.post('/subscribe', async (req, res) => {
            const books = req.body;
            const result = await subscriberCollection.insertOne(books);
            res.send(result);
        });




        //   books get
        app.get('/wishlist',verify, async (req, res) => {
            const queryEmail = req.query.email;
            const tokenEmail = req.user.email;


            if (queryEmail !== tokenEmail) {
                return res.status(403).send({ message: 'forbiddedn access!' })
            }
            let query = {}
            if (queryEmail) {
                query.email = queryEmail;
            }
            const result = await wishListCollection.find(query).toArray()
            res.send(result)
        })


        // get specific data 
        app.get('/getuserdata', async (req, res) => {
            const userEmail = req.query.email;
            const tokenEmail = req.user.email;
            // console.log(userEmail,tokenEmail)
            // match user mail to cheak is it a valid user

            if (userEmail !== tokenEmail) {
                return res.status(403).send({ message: 'forbiddedn access!' })
            }



            let query = {}
            if (userEmail) {
                query.email = userEmail;
            }
            const result = await booksCollection.find(query).toArray()
            res.send(result)
        })
        // get category

        app.get('/getcategory', async (req, res) => {
            const cursor = categoryCollection.find();
            const user = await cursor.toArray()
            res.send(user)
        })

        //    delete data
        app.delete('/book/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await wishListCollection.deleteOne(query);
            res.send(result)
        })

        // get one toyota car in database 
        app.get("/getbook/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const user = await booksCollection.findOne(query)
            res.send(user)
        })



        // get books

        app.get('/getbooks', async (req, res) => {

            let queryObj = {}
            // category
            const category = req.query.category;
            // for pagination
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);

            const skip = (page - 1) * limit

            if (category) {
                queryObj.category = category
            }
            const cursor = booksCollection.find(queryObj).skip(skip).limit(limit);


            const result = await cursor.toArray()

            // count data
            const total = await booksCollection.countDocuments()

            res.send({
                total,
                result
            })

            //     catch(error){
            //    console.log(error);
            //    res.status(500).send("An erro occour")
            //     }

        })

        // for recent blog page sort by date
        app.get('/recent', async (req, res) => {

            let recentSortObj = {}
            const sortField = req.query.sortField
            const sortOrder = req.query.sortOrder
            if (sortField && sortOrder) {
                recentSortObj[sortField] = sortOrder;
            }

            const cursor = booksCollection.find().sort(recentSortObj)
            const result = await cursor.toArray()
            res.send(result)
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










app.get("/", (req, res) => {
    res.send("conffee serverr is running")
})


app.listen(port, () => {
    console.log(`coffee server is running on port${port}`)
})