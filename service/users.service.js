import { client } from "../index.js";

export async function updatePassword(email, hashedPassword) {
  const updated = {
    password: hashedPassword,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ email: email }, { $set: updated });
}
export async function getUserByName(email) {
  return await client
    .db("b42wd2")
    .collection("users")
    .findOne({ email: email });
}
export async function getOtp(OTP) {
  return await client.db("b42wd2").collection("users").findOne({ OTP: OTP });
}
export async function addUser(data) {
  return await client.db("b42wd2").collection("users").insertOne(data);
}
export async function updateOtp(email, randomNumber) {
  const updated = {
    OTP: randomNumber,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ email: email }, { $set: updated });
}
export async function deleteOtp(otp) {
  const data = {
    OTP: otp,
  };
  return await client
    .db("b42wd2")
    .collection("users")
    .updateOne({ OTP: otp }, { $unset: data });
}
