const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConfig");

const { authenticate } = require("../auth/authenticate");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function generateToken(username) {
  const payload = {
    username
  };

  const options = {
    expiresIn: "45m",
    jwtid: "12345"
  };

  const secret = process.env.JWT_SECRET;
  console.log(secret);
  const token = jwt.sign(payload, secret, options);
  return token;
}

function register(req, res) {
  const user = req.body;
  if (
    !user.username ||
    typeof user.username !== "string" ||
    user.username === ""
  ) {
    res.status(400).json({ message: "Username must be a valued string." });
  } else if (
    !user.password ||
    typeof user.password !== "string" ||
    user.password === ""
  ) {
    res.status(400).json({
      message: "Password must be a valued string."
    });
  } else {
    const creds = req.body;
    const hash = bcrypt.hashSync(creds.password, 14);
    creds.password = hash;
    db("users")
      .insert(creds)
      .then(id => {
        res.status(201).json(id);
      })
      .catch(() => {
        res.status(500).json({ error: "Unable to register user." });
      });
  }
}
function login(req, res) {
  // implement user login
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
