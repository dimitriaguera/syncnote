const express = require("express");
const path = require("path");
const chalk = require("chalk");
const dateFormat = require("dateformat");
const passport = require("passport");
const bodyParser = require("body-parser");
const mongodb = require("./server/db/mongodb");
const config = require("./config.server");
const authRoute = require("./server/auth/route");
const authModel = require("./server/auth/model");
const nodeRoute = require("./server/node/route");
const nodeModel = require("./server/node/model");
const syncRoute = require("./server/sync/route");
const broker = require("./server/share/broker");
const strategy = require("./server/auth/strategy");
const socketConnect = require("./server/socket/connect");
const app = express();
const cors = require("cors");

// Enable CORS.
app.use(
  cors({
    // credentials: true,
    // origin: (origin, callback) => {
    //   if (config.whitelist.includes(origin)) return callback(null, true);
    //   callback(new Error("Not allowed by CORS"));
    // }
  })
);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// db connect
(async function() {
  try {
    await mongodb.connect();
    console.log(chalk.green("Database start !"));

    // Set strategy.
    strategy.init(app, passport);

    // Set models.
    authModel.init();
    nodeModel.init();

    // Start borker.
    broker.init();

    // Set route.
    authRoute(app);
    nodeRoute(app);
    syncRoute(app);

    // Init Connect socket.
    const serve = socketConnect(app);

    // Start server.
    serve.on("error", e => {
      if (e.code === "EADDRINUSE") {
        console.log(
          chalk.bgRed("Address/port already in use, please change port...")
        );
        serve.close();
        process.exit();
      } else {
        console.log(chalk.bgRed("Error when starting server"));
        serve.close();
        process.exit();
      }
    });

    // Start server.
    serve.listen(config.port, () => {
      console.log(
        chalk.green(
          `SERVER STARTED at ${dateFormat(new Date(), "isoDateTime")}`
        )
      );
      console.log(chalk.green(`PORT LISTENED :: ${config.port}`));
      console.log(chalk.green(`MODE ${process.env.NODE_ENV}`));
    });
  } catch (e) {
    console.error(e);
  }
})();
