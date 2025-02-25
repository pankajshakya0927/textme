const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors');
const helmet = require("helmet");

const userRoute = require("./routes/user");
const chatRoute = require("./routes/chat");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.get('/api', (req, res) => res.send('TextMe API Working successfully ✅'))
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

// serve the static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

module.exports = app;
