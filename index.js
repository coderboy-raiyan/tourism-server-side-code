const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqspl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travel_places");
    const travelCollection = database.collection("places");
    const placeOrder = database.collection("order_details");

    // get all the places in the database
    app.get("/places", async (req, res) => {
      const places = await travelCollection.find({}).toArray();
      res.send(places);
    });

    // get a singal place details
    app.get("/places/:id", async (req, res) => {
      const placeId = req.params.id;
      const query = { _id: ObjectId(placeId) };
      const result = await travelCollection.findOne(query);
      res.send(result);
    });

    // post a order details
    app.post("/place/going", async (req, res) => {
      const order = req.body;
      const result = await placeOrder.insertOne(order);
      res.send(result.acknowledged);
    });

    // find the based on  orders email
    app.get("/orders/:email", async (req, res) => {
      const orderEmail = req.params.email;
      const query = { email: orderEmail };
      const result = await placeOrder.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    // delete a order from database
    app.delete("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { _id: ObjectId(orderId) };
      const result = await placeOrder.deleteOne(query);
      res.send(result.acknowledged);
    });

    // get all the placeOrder details from database
    app.get("/placeorder", async (req, res) => {
      const orders = await placeOrder.find({}).toArray();
      res.send(orders);
    });

    // delete a sigal order by id from orders
    app.delete("/placeorder/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { _id: ObjectId(orderId) };
      const result = await placeOrder.deleteOne(query);
      res.send(result.acknowledged);
      // console.log(result);
    });

    // update a placeOrder status
    app.put("/placeorder", async (req, res) => {
      const orderId = req.body;
      const mainId = orderId.id;
      const query = { _id: ObjectId(mainId) };
      const options = { upsert: true };
      // const result = await placeOrder.findOne(query);
      const updateDoc = {
        $set: {
          orderStatus: `Approved`,
        },
      };
      const uresult = await placeOrder.updateOne(query, updateDoc, options);
      res.send(uresult.acknowledged);
    });

    // Add a new service api
    app.post("/place", async (req, res) => {
      const placeData = req.body;
      const result = await travelCollection.insertOne(placeData);
      res.send(result.acknowledged);
    });

    console.log("connected");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
