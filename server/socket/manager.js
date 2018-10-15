const _ = require("lodash");
const _SOCKET_USER_STORE = {};

module.exports = {
  broadcastOwnerAndShare: (socket, room, data) => {
    const uIds = [data.owner];
    data.shared.forEach(id => {
      uIds.push(id);
    });
    console.log(uIds);
    uIds.forEach(uid => {
      if (!_SOCKET_USER_STORE[uid]) return;
      console.log(_SOCKET_USER_STORE[uid]);
      _SOCKET_USER_STORE[uid].forEach(sId => {
        socket.broadcast.to(sId).emit(room, data);
      });
    });
  },

  unregisterUser: socket => {
    const uID = socket.userId;
    const sID = socket.id;
    try {
      _.pull(_SOCKET_USER_STORE[uID], sID);
      console.log("REMOVE_ACTION: ", _SOCKET_USER_STORE);
    } catch (e) {
      console.log("Error Socket Manager during unregistration.");
    }
  },

  addUserMiddleware: (socket, next) => {
    const uID = socket.userId;
    const sID = socket.id;

    if (uID) {
      if (!_SOCKET_USER_STORE[uID]) {
        _SOCKET_USER_STORE[uID] = [sID];
      } else {
        _SOCKET_USER_STORE[uID].push(sID);
      }
    }
    console.log("ADD_ACTION: ", _SOCKET_USER_STORE);
    next();
  }
};
