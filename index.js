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
    const { name, email, password } = request.body;
    const userFromDb = await getUserByName(email);
    // check email exists
    if (userFromDb) {
      response.status(401).send({ message: "email already exists" });
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
        name: name,
        email: email,
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
    const { email, password } = request.body;
    const userFromDb = await getUserByName(email);
    // check email exists
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

app.post("/login/forgetpassword", async function (request, response) {
  const { email } = request.body;
  const userFromDb = await getUserByName(email);
  if (!userFromDb) {
    response.status(401).send({ message: "invalid credentials" });
  } else {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const setOtp = updateOtp(email, randomNumber);
    const sender = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.Password,
      },
    });
    const composeMail = {
      from: process.env.Email,
      to: email,
      subject: "OTP for Reset Password",
      text: `${randomNumber}`,
    };
    sender.sendMail(composeMail, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email ${info.response}`);
      }
    });
  }
  response.status(200).send({ message: "OTP sent successfully" });
});

app.post("/verifyotp", async function (request, response) {
  const { OTP } = request.body;
  const otp = parseInt(OTP);
  const otpFromDB = await getOtp(otp);
  if (otpFromDB === null) {
    response.status(401).send({ message: "Invalid OTP" });
  } else if (otpFromDB.OTP === otp) {
    const deleteOtpDB = await deleteOtp(otp);
    response.status(200).send({ message: "OTP verified successfully" });
  }
});

app.post("/setpassword", express.json(), async function (request, response) {
  try {
    const { email, password } = request.body;
    const userFromDb = await getUserByName(email);
    // check email exists
    if (!userFromDb) {
      response.status(401).send({ message: "Invalid Credentials" });
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
      const result = await updatePassword(email, hashedPassword);

      response.send({ message: "password changed successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

async function updatePassword(email, hashedPassword) {
  const updated = {
    password: hashedPassword,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ email: email }, { $set: updated });
}

async function getUserByName(email) {
  return await client
    .db("b42wd2")
    .collection("users")
    .findOne({ email: email });
}

async function getOtp(OTP) {
  return await client.db("b42wd2").collection("users").findOne({ OTP: OTP });
}

async function addUser(data) {
  return await client.db("b42wd2").collection("users").insertOne(data);
}

async function updateOtp(email, randomNumber) {
  const updated = {
    OTP: randomNumber,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ email: email }, { $set: updated });
}

async function deleteOtp(otp) {
  const data = {
    OTP: otp,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ OTP: otp }, { $unset: data });
}

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
