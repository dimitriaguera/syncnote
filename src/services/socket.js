import io from "socket.io-client";
import { getLocalToken } from "./session";
import config from "../config.public";

// @todo change how this url is generated
const url = config.socket.url;
let _SOCKET = null;

initSocket();

export default {
  get: () => {
    return _SOCKET;
  },

  emit: (room, data, callback) => {
    _SOCKET.emit(room, data, callback);
  },

  eventRegister: (room, handler) => {
    _SOCKET.on(room, handler);
  },

  resetToken: () => {
    _SOCKET.io.opts.query = { token: getLocalToken() };
  },

  close: () => {
    _SOCKET.close();
  },

  open: () => {
    try {
      _SOCKET.io.opts.query = { token: getLocalToken() };
      _SOCKET.open();
    } catch (e) {
      console.log("Can't openning socket.");
    }
  }
};

function initSocket(path) {
  const options = { autoConnect: false, query: { token: getLocalToken() } };

  // Try to connect.
  const socket = io.connect(
    url,
    options
  );

  _SOCKET = socket;

  // Manage socket error or fail events.
  errorSocketEvents(socket);
}

function errorSocketEvents(socket) {
  // Catch error send by server.
  socket.on("error", function(err) {
    console.log("Server socket sent an error", err);
  });

  // Catch error on client side connexion request.
  socket.on("connect_error", function(err) {
    console.log("Connexion error", err);
    socket.close();
  });

  // Stop if reconnect failed.
  socket.on("reconnect_failed", () => {
    console.log("Reconnect failed");
    socket.close();
  });
}
