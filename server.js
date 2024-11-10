const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const UsersModel = require("./module/Users");
dotenv.config();

app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   next();
// });

mongoose.connect(process.env.MONGO_URI);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server Running at http://localhost:3001");
});

app.get("/", async (req, res) => {
  res.json("Hello");
});

app.post("/register", async (req, res) => {
  const { username, name, email, password } = req.body;
  const checkUser = await UsersModel.findOne({ username: username });
  if (checkUser) {
    res.status(400);
    res.json("User already exists");
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    UsersModel.insertMany({
      username,
      name,
      email,
      password: hashedPassword,
    });
    res.status(200);
    res.json("User Created Successfully");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UsersModel.findOne({ username });
  if (username === "" || password === "") {
    res.status(400);
    res.json("Bad Request");
  }
  if (!user) {
    res.status(400);
    res.json("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (isPasswordMatched === true) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, process.env.JWT_TOKEN);
      res.send({ jwtToken });
    } else {
      res.status(400);
      res.json("Invalid Password");
    }
  }
});
