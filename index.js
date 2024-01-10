const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.bbqqyyb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    client.connect();
    const collegeCollection = client.db("colleges").collection("college");
    const usersCollection = client.db("colleges").collection("users");
    const AdmittedCollegeCollection = client.db("colleges").collection("admitted");
    const commentsCollection = client
      .db("bootcamp-client")
      .collection("comments");
    // root page
    app.get("/", (req, res) => {
      res.send("college server running");
    });

    // get posts from mongodb service collection
    app.get("/colleges", async (req, res) => {
      const query = {};
      const result = await collegeCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/colleges/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-college/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await AdmittedCollegeCollection.findOne(query);
      res.send(result);
    });


    // post comments to mongodb database
    app.post("/admitted-college", async (req, res) => {
      let query = req.body;
      const review = await AdmittedCollegeCollection.insertOne(query);
      res.send(review);
    });

    app.get("/comment/:id", async (req, res) => {
      const id = req.params.id;
      let query = { postId: id };
      const comment = await commentsCollection.find(query).toArray();
      res.send(comment);
    });

    app.post("/users", async (req, res) => {
      const data = req.body;
      const { uid } = data;
      const query = { uid: uid };
      const selectedAccount = await usersCollection.findOne(query);
      if (!selectedAccount) {
        const result = await usersCollection.insertOne(data);
        res.send(result);
      }
    });

    app.get("/user/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`college   running on port ${port}`);
});
