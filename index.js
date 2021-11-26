const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000
const ObjectId = require('mongodb').ObjectId;


app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p0mef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.get('/', (req, res) => {
    res.send('Pen World!')
})

async function run() {
    try {
        // databae connection
        await client.connect();

        const database = client.db('PENS_GALAXY');
        const pensCollection = await database.collection('pens');
        const ordersCollection = await database.collection('orders');
        const usersCollection = await database.collection('users');
        const reviewCollection = await database.collection('review');


        //Post Order
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review)
        })

        //rreview post

        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })

        //get all order
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })
        //Get Order for single user
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)
        })


        //Get all data
        app.get('/pens', async (req, res) => {
            const cursor = pensCollection.find({});
            const pens = await cursor.toArray();
            res.send(pens)
        })

        //Get Single Data

        app.get('/pens/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId }
            const pen = await pensCollection.findOne(query);
            res.json(pen);
        })
        //psot api
        app.post('/pens', async (req, res) => {

            const pen = req.body

            const result = await pensCollection.insertOne(pen);
            res.json(result)
        })

        //post user information

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(updateDoc);
            res.json(result)
        });


        //delete user order


        app.delete('/orders/:id', async (req, res) => {
           
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);

            console.log('Deleting user with id: ', result);
            res.json(result);
        });
        app.delete('/pens/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await pensCollection.deleteOne(query);
            res.json(result);
        });


  

//make an user to an admin
 app.put("/users/admin", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.json(result);
  });
 



        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Shipped'
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        });


    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(` listening at ${port}`)
})