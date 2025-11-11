const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.u12htqq.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("plate share server");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("plate_db");
    const foodCollection = db.collection("foods");
    const bidsCollection = db.collection("bids");
    const userCollection = db.collection("users");

    // user related api
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "user already exits. do not need to insert again",
        });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });
    // food api
    app.get("/foods", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.donator_email = email;
      }
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.get("/featured-foods", async (req, res) => {
      // const foodField = {};
      const cursor = foodCollection
        .find()
        .sort({
          food_quantity: -1,
        })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const newProduct = req.body;
      const result = await foodCollection.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedFood.name,
        },
      };
      const result = await foodCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // bids related apis
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};

      if (email) {
        query.donator_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`plate server is running : ${port}`);
});
