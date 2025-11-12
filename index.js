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
    // await client.connect();

    const db = client.db("plate_db");
    const foodCollection = db.collection("foods");
    const foodRequestCollection = db.collection("food-request");
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

    app.get("/foods", async (req, res) => {
      const foods = await foodCollection.find().toArray();
      res.send(foods);
    });

    app.post("/foods", async (req, res) => {
      const newProduct = req.body;
      const result = await foodCollection.insertOne(newProduct);
      res.send(result);
    });

    // app.patch("/foods/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatedFood = req.body;
    //   const query = { _id: new ObjectId(id) };
    //   const update = {
    //     $set: {
    //       name: updatedFood,
    //     },
    //   };
    //   const result = await foodCollection.updateOne(query, update);
    //   res.send(result);
    // });

    app.get("/my-foods/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await foodCollection
          .find({ donator_email: email })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch user foods" });
      }
    });

    app.put("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedFood = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updatedFood,
          },
        };
        const result = await foodCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update food" });
      }
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // bids related apis
    app.get("/food-request", async (req, res) => {
      const email = req.query.email;
      const query = {};

      if (email) {
        query.donator_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/foods/food-request/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { food_id: productId };
      const cursor = foodRequestCollection.find(query).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/food-request", async (req, res) => {
      const newBid = req.body;
      const result = await foodRequestCollection.insertOne(newBid);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
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
