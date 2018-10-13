const express = require("express");
const path = require("path");
const passport = require("passport");
const bodyParser = require("body-parser");
const mongodb = require("./server/db/mongodb");
const config = require("./config.server");
const authRoute = require("./server/auth/route");
const authModel = require("./server/auth/model");
const nodeRoute = require("./server/node/route");
const nodeModel = require("./server/node/model");
const strategy = require("./server/auth/strategy");
const app = express();
const cors = require("cors");

// Enable CORS.
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// db connect
(async function() {
  try {
    await mongodb.connect();
    console.log("Database start !");

    // Set strategy.
    strategy.init(app, passport);

    // Set models.
    authModel.init();
    nodeModel.init();

    // Set route.
    authRoute(app);
    nodeRoute(app);
  } catch (e) {
    console.error(e);
  }
})();

// Set port to be used by Node.js
app.set("port", 5000);

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.listen(app.get("port"), () => {
  console.log("Node app is running on port", app.get("port"));
});
