import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();

const PORT = 4000;
// const MONGO_URL = "mongodb://127.0.0.1";
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(express.json());
app.use(cors());

app.get("/mobiles", async function (request, response) {
  const result = await client
    .db("b42wd2")
    .collection("mobiles")
    .find({})
    .toArray();
  response.send(result);
});

app.post("/addmobiles", async function (request, response) {
  const data = request.body;
  const result = await client
    .db("b42wd2")
    .collection("mobiles")
    .insertMany(data);
  response.send(result);
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
