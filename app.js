const express = require("express");
const app = express();
const db = require("./db");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors');

const userRoute = require("./routes/user");
const chatRoute = require("./routes/chat");
const messageRoute = require("./routes/message");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

// serve the static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/public"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/public/index.html"));
  });
}

module.exports = app;
