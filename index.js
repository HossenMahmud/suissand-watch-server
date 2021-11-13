const express = require('express');
const { MongoClient } = require('mongodb');
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ykyx1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Suissand_Watch");
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection("reviews");
        const watchesCollection = database.collection("watches");

        // POST API Add Package
        app.post('/addwatches', async (req, res) => {
            const newWatch = req.body;
            const result = await watchesCollection.insertOne(newWatch);
            res.send(result);
        });
        // get watches
        app.get('/watches', async (req, res) => {
            const cursor = watchesCollection.find({});
            const watches = await cursor.toArray();
            res.send(watches);
        });
        // Delete Watch product
        app.delete('/deletewatch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await watchesCollection.deleteOne(query);
            res.send(result)
        });

        //GET Single Watch API
        app.get('/watch/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tourPackage = await watchesCollection.findOne(query);
            res.send(tourPackage);
        });

        // Add user into database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        });

        // get user info
        app.get('/users/:email/', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })

        })

        // Add Review into database
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });
        // GET API display All Reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });

        // Add order into database
        app.post('/orders', async (req, res) => {
            const appointment = req.body;
            const result = await ordersCollection.insertOne(appointment)
            res.json(result)
        })
        // GET API Display All Orders
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // Get My Order
        app.get("/order/:email", async (req, res) => {
            const result = await ordersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        // Delete Order
        app.delete('/deleteOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.send(result)
        });

        // Add Admin role user 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Running Server")
})

app.listen(port, () => {
    console.log(`Example app listening at Port:${port}`)
})
