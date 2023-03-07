import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "./auth.js";
import cors from "cors";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();

const PORT = 4000;
// const MONGO_URL = "mongodb://127.0.0.1";
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(express.json()); // intercepts every requests if need it converts data ito json
app.use(cors());

app.get("/mobiles", auth, async function (request, response) {
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

// function for hashing password
async function generateHashedPassword(password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

app.post("/signup", express.json(), async function (request, response) {
  try {
    const { username, password } = request.body;
    const userFromDb = await getUserByName(username);
    // check username exists
    if (userFromDb) {
      response.status(401).send({ message: "username already exists" });
    }
    //set password length for security purposes
    else if (password.length < 8) {
      response
        .status(400)
        .send({ message: "Password must be at least 8 characters" });
    }
    //all condition passed allowed add user with hash value
    else {
      const hashedPassword = await generateHashedPassword(password);
      const result = await addUser({
        username: username,
        password: hashedPassword,
      });

      response.send(result);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async function (request, response) {
  try {
    const { username, password } = request.body;
    const userFromDb = await getUserByName(username);
    // check username exists
    if (!userFromDb) {
      response.status(401).send({ message: "invalid credentials" });
    } else {
      const storedPassword = userFromDb.password;
      const isPasswordCheck = await bcrypt.compare(password, storedPassword);
      if (isPasswordCheck) {
        const token = jwt.sign({ id: userFromDb._id }, process.env.Secret_Key);
        response.send({ message: "login successfull", token: token });
      } else {
        response.status(401).send({ message: "invalid credentials" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

async function addUser(data) {
  return await client.db("b42wd2").collection("users").insertOne(data);
}

app.post("/login/forgetpassword", async function (request, response) {
  const { username } = request.body;
  const userFromDb = await getUserByName(username);
  if (!userFromDb) {
    response.status(401).send({ message: "invalid credentials" });
  } else {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const setOtp = updateOtp(username, randomNumber);
  }
  response.send({ message: "OTP sent successfully" });
});

async function getUserByName(username) {
  return await client
    .db("b42wd2")
    .collection("users")
    .findOne({ username: username });
}

async function updateOtp(username, randomNumber) {
  const updated = {
    OTP: randomNumber,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ username: username }, { $set: updated });
}

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
