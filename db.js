const mongoose = require("mongoose");
const connectionUrl = "mongodb://127.0.0.1:27017/textme";

mongoose
  .connect(process.env.MONGODB_URI || connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log("Connected to mongodb..."))
  .catch((err) => console.error(err));

module.exports = mongoose;
