import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import cors from "cors";
import userRouter from "./router/users.router.js";
import MobileRouter from "./router/mobile.router.js";
dotenv.config();
const app = express();

const PORT = 4000;
// const MONGO_URL = "mongodb://127.0.0.1";
const MONGO_URL = process.env.MONGO_URL;
export const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(express.json()); // intercepts every requests if need it converts data ito json
app.use(cors());

app.use("/", userRouter);
app.use("/", MobileRouter);

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
