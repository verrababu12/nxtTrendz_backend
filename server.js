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

// Allow all origins or specify certain origins:
app.use(
  cors({ origin: "https://veerababu7cpu3rjscpfoqqb.drops.nxtwave.tech" })
);
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

  // Check if the password is provided
  if (!password || password.trim() === "") {
    return res.status(400).json("Password is required");
  }

  // Check if the user already exists
  const checkUser = await UsersModel.findOne({ username: username });
  if (checkUser) {
    return res.status(400).json("User already exists");
  }

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    await UsersModel.insertMany({
      username,
      name,
      email,
      password: hashedPassword,
    });

    // Respond with success
    res.status(200).json("User Created Successfully");
  } catch (error) {
    // Handle errors if something goes wrong
    console.error(error);
    res.status(500).json("Internal Server Error");
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
