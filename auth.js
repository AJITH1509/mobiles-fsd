//custom middleware
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    jwt.verify(token, process.env.Secret_Key);
    next();
  } catch (err) {
    res.status(401).send({ message: err.message });
  }
};
