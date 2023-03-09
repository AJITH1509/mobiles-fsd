import { client } from "../index.js";

export async function addMobile(data) {
  return await client.db("b42wd2").collection("mobiles").insertMany(data);
}
export async function getAllMobiles() {
  return await client.db("b42wd2").collection("mobiles").find({}).toArray();
}
