const {
  getNodeById,
  updateNodeById,
  getNodeByUserId
} = require("../node/controller");
//const { broadcastOwnerAndShare } = require("../socket/manager");
const { preparNodeToUpdate } = require("../node/model");
const mongodb = require("../db/mongodb");

const SYNC_WAIT_OK = 0;
const SYNC_WAIT_CREA = 1;
const SYNC_WAIT_UPT = 2;
const SYNC_WAIT_DEL = 3;

module.exports = {
  registerToSync: socket => {
    // Register on socket event.
    socket.on("push", pushHandlerBuilder(socket, "push_ok", "push_errors"));
    socket.on("sync", syncHanlerBuilder(socket, "sync_ok", "sync_errors"));
  }
};

// Manage Sync client request.
function syncHanlerBuilder(socket, roomOk, roomError) {
  return async (localNodes, send) => {
    try {
      // Get user's ID connected on current socket.
      const _uId = socket.userId;

      // Get all user nodes in remote db.
      const remoteNodes = await getNodeByUserId(_uId);

      // Compare all nodes and dispatch on right sync action.
      const { _actions, _bulk } = await compareForSync(remoteNodes, localNodes);

      // Send immediate CRUD or CONFLICT actions to perform in local.
      send(_actions);

      // Execute CRUD sync op in remote DB and get errors.
      if (_bulk.length) {
        try {
          const bulkResult = await _bulk.execute();
          socket.emit(roomOk, bulkResult);
        } catch (err) {
          socket.emit(roomError, err);
        }
      }
    } catch (err) {
      console.error(err);
      send(err);
    }
  };
}

// Emit changes to all Sockets clients.
function pushHandlerBuilder(socket, roomOk, roomError) {
  return async (localNode, send) => {
    try {
      // Get node's ID.
      const _nId = localNode._id;

      // Get node in remote db.
      const remoteNode = await getNodeById(_nId);
      console.log(remoteNode);

      // Compare all nodes and dispatch on right sync action.
      const { _actions, _bulk } = await compareForSync(
        remoteNode ? [remoteNode] : [],
        {
          [_nId]: localNode
        }
      );

      // Send immediate CRUD or CONFLICT actions to perform in local.
      send(_actions);

      // Execute CRUD sync op in remote DB and get errors.
      if (_bulk.length) {
        try {
          const bulkResult = await _bulk.execute();
          socket.emit(roomOk, bulkResult);
        } catch (err) {
          socket.emit(roomError, err);
        }
      }
    } catch (err) {
      console.error(err);
      send(err);
    }
  };
}

class Action {
  constructor() {
    this.type = null;
    this.data = null;
  }
  add(data) {
    this.type = "add";
    this.data = data;
    return this;
  }
  update(data) {
    this.type = "update";
    this.data = data;
    return this;
  }
  remove(data) {
    this.type = "remove";
    this.data = data;
    return this;
  }
  ok(data) {
    this.type = "ok";
    this.data = data;
    return this;
  }
  conflict(data) {
    this.type = "conflict";
    this.data = data;
    return this;
  }
  getType() {
    return this.type;
  }
  getData() {
    return this.data;
  }
}

async function compareForSync(remoteNodes, localNodes) {
  const _actions = [];
  const local = Object.assign({}, localNodes);
  const bulk = mongodb
    .getDb()
    .collection("node")
    .initializeUnorderedBulkOp();

  remoteNodes.forEach(remoteNode => {
    // Get current local node.
    const localNode = local[remoteNode._id];
    const _action = new Action();

    // If remote node doesn't exit in local, create it.
    if (!localNode) {
      // CREATE IN LOCAL
      _actions.push(_action.add(remoteNode));
      return;
    }

    // Remove local node from obj.
    delete local[remoteNode._id];

    // If no change in _rev id.
    if (remoteNode._rev === localNode._rev) {
      switch (localNode._sync_wait) {
        case SYNC_WAIT_OK:
          // END OK SYNC TO LOCAL.
          _actions.push(
            _action.ok({ _id: remoteNode._id, _tId: localNode._tId })
          );
          break;
        case SYNC_WAIT_CREA:
          // ALREADY EXIST IN REMOTE
          _actions.push(
            _action.conflict({
              code: "EXIST",
              text: "Node already exist in remote DB",
              nId: remoteNode._id
            })
          );
          break;
        case SYNC_WAIT_UPT:
          // UPDT TO REMOTE
          bulk
            .find({
              _id: localNode._id
            })
            .updateOne(preparNodeToUpdate(localNode));
          break;
        case SYNC_WAIT_DEL:
          // DEL IN REMOTE
          bulk
            .find({
              _id: localNode._id
            })
            .removeOne();
          break;
        default:
          break;
      }
    }

    // If changes in _rev id.
    else {
      switch (localNode._sync_wait) {
        case SYNC_WAIT_OK:
          // UPDT TO LOCAL
          _actions.push(_action.update(remoteNode));
          break;
        case SYNC_WAIT_CREA:
          // CONFLICT ID ALREADY EXIST
          _actions.push(
            _action.conflict({
              code: "EXIST",
              text: "Node already exist in remote DB",
              rNode: remoteNode
            })
          );
          break;
        case SYNC_WAIT_UPT:
          // CONFLICT MERGE REQUEST
          _actions.push(
            _action.conflict({
              code: "MERGE",
              text: "Node update conflict",
              rNode: remoteNode
            })
          );
          break;
        case SYNC_WAIT_DEL:
          // CONFLICT DEL NODE UPDATED
          _actions.push(
            _action.conflict({
              code: "DEL_UPDT",
              text: "Node to delete have been updated bedore",
              rNode: remoteNode
            })
          );
          break;
        default:
          break;
      }
    }
  });

  // Rest nodes existing in local but not in remove.
  // Those nodes are new created in local, or deleted in remote.
  Object.keys(local).forEach(key => {
    const localNode = local[key];
    const _action = new Action();

    switch (localNode._sync_wait) {
      case SYNC_WAIT_OK:
        // DELETE LOCAL
        _actions.push(_action.remove(localNode));
        break;
      case SYNC_WAIT_CREA:
        // ADD TO REMOTE
        bulk.insert(preparNodeToUpdate(localNode));
        break;
      case SYNC_WAIT_UPT:
        // DELETE LOCAL - better to create remote ???
        _actions.push(_action.remove(localNode));
        break;
      case SYNC_WAIT_DEL:
        // NOTHING : local poubelle process.
        break;
      default:
        break;
    }
  });

  return { _actions: _actions, _bulk: bulk };
}
