const socketServer = require("socket.io");
const { socketStrategy } = require("../auth/strategy");
const chalk = require("chalk");
const http = require("http");
const { addUserMiddleware, unregisterUser } = require("./manager");
const { registerToSync } = require("../sync/sync.controller");

module.exports = function(app) {
  const serve = http.createServer(app);
  const io = socketServer(serve);
  const nsp = io.of("/socket");

  nsp.use(socketStrategy());
  nsp.use(addUserMiddleware);

  nsp.on("connection", eventRegistration);

  return serve;
};

function eventRegistration(socket) {
  // Rooms registration.
  registerToSync(socket);

  // Socket connexion.
  console.log(
    chalk.cyan(`CONNECTED to socket ${socket.id} for user ID ${socket.userId}`)
  );
  // Socket disconnexion.
  socket.on("disconnect", function() {
    unregisterUser(socket);
    console.log(
      chalk.cyan(
        `DISCONNECTED to socket ${socket.id} for user ID ${socket.userId}`
      )
    );
  });
}
