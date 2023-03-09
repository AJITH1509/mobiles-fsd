import express from "express";
import { auth } from "../auth.js";
import { getAllMobiles, addMobile } from "../service/mobile.service.js";
const router = express.Router();

router.get("/mobiles", async function (request, response) {
  const result = await getAllMobiles();
  response.send(result);
});
router.post("/addmobiles", async function (request, response) {
  const data = request.body;
  const result = await addMobile(data);
  response.send(result);
});
export default router;
