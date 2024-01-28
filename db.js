const mongoose = require("mongoose");
const connectionUrl = "mongodb+srv://pankajshakya:27P09s1994@textmecluster.c6y6dkz.mongodb.net/textme?retryWrites=true&w=majority";
// const connectionUrl = "mongodb://127.0.0.1:27017/textme"; // local connection url

mongoose
  .connect(process.env.MONGODB_URI || connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log("Connected to mongodb..."))
  .catch((err) => console.error(err));

module.exports = mongoose;
