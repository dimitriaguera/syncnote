const { updateNodeById, getNodeByUserId } = require("../node/controller");
//const { broadcastOwnerAndShare } = require("../socket/manager");
const { preparNodeToUpdate } = require("../node/model");
const mongodb = require("../db/mongodb");

const uuidv1 = require("uuid/v1");

const SYNC_WAIT_OK = 0;
const SYNC_WAIT_CREA = 1;
const SYNC_WAIT_UPT = 2;
const SYNC_WAIT_DEL = 3;
const SYNC_STATUS_DONE = 0;
const SYNC_STATUS_PENDING = 1;
const SYNC_STATUS_CONFLICT = 2;
const SYNC_STATUS_ERROR = 3;

module.exports = {
  registerToSync: socket => {
    // Register on socket event.
    socket.on("push", pushHandlerBuilder(socket, "pull"));
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
function pushHandlerBuilder(socket, room) {
  return async (data, send) => {
    try {
      const _node = preparNodeToUpdate(data);
      const rapport = await updateNodeById(_node._id, _node);
      //broadcastOwnerAndShare(socket, room, _node);
      send(rapport);
    } catch (err) {
      console.error(err);
      send(err);
    }
  };
}

async function compareForSync(remoteNodes, localNodes) {
  const _actions = { conflicts: [], add: [], update: [], remove: [], ok: [] };
  const local = Object.assign({}, localNodes);
  const bulk = mongodb
    .getDb()
    .collection("node")
    .initializeUnorderedBulkOp();

  // bulk.insert({
  //   _id: "36cdcc60-d92e-11e8-914a-0b0ae10498c5",
  //   _tId: uuidv1(),
  //   _rev: uuidv1(),
  //   name: "pfff
  // bulk.find({ _id: "test1" }).removeOne();
  // bulk.find({ _id: "test2" }).removeOne();f",
  //   owner: "user1",
  //   parent: null,
  //   shared: []
  // });

  bulk.insert({
    _id: "test1",
    _tId: uuidv1(),
    _rev: uuidv1(),
    name: "pffff",
    owner: "user1",
    parent: null,
    shared: []
  });

  bulk.insert({
    _id: "test2",
    _tId: uuidv1(),
    _rev: uuidv1(),
    name: "pffff",
    owner: "user1",
    parent: null,
    shared: []
  });

  bulk
    .find({
      _id: "36cdcc60-d92e-11e8-914a-0b0ae10498c5"
    })
    .removeOne();
  bulk.find({ _id: "test1" }).removeOne();
  bulk.find({ _id: "test2" }).removeOne();
  bulk.find({ _id: "test1" }).updateOne({ $set: { name: "pfff1" } });
  bulk.find({ _id: "test2" }).updateOne({ $set: { name: "pfff2" } });

  bulk.insert({
    _id: uuidv1(),
    _tId: uuidv1(),
    _rev: uuidv1(),
    name: "pffff",
    owner: "user1",
    parent: null,
    shared: []
  });

  remoteNodes.forEach(remoteNode => {
    // Get current local node.
    const localNode = local[remoteNode._id];

    // If remote node doesn't exit in local, create it.
    if (!localNode) {
      // CREATE IN LOCAL
      _actions.add.push(remoteNode);
      return;
    }

    // Remove local node from obj.
    delete local[remoteNode._id];

    // If no change in _rev id.
    if (remoteNode._rev === localNode._rev) {
      switch (localNode._sync_wait) {
        case SYNC_WAIT_OK:
          // END OK SYNC TO LOCAL.
          _actions.ok.push(remoteNode._id);
          break;
        case SYNC_WAIT_CREA:
          // ALREADY EXIST IN REMOTE
          _actions.conflicts.push({
            code: "EXIST",
            text: "Node already exist in remote DB",
            nId: remoteNode._id
          });
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
          _actions.update.push(remoteNode);
          break;
        case SYNC_WAIT_CREA:
          // CONFLICT ID ALREADY EXIST
          _actions.conflicts.push({
            code: "EXIST",
            text: "Node already exist in remote DB",
            rNode: remoteNode
          });
          break;
        case SYNC_WAIT_UPT:
          // CONFLICT MERGE REQUEST
          _actions.conflicts.push({
            code: "MERGE",
            text: "Node update conflict",
            rNode: remoteNode
          });
          break;
        case SYNC_WAIT_DEL:
          // CONFLICT DEL NODE UPDATED
          _actions.conflicts.push({
            code: "DEL_UPDT",
            text: "Node to delete have been updated bedore",
            rNode: remoteNode
          });
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
    switch (localNode._sync_wait) {
      case SYNC_WAIT_OK:
        // DELETE LOCAL
        _actions.remove.push(localNode);
        break;
      case SYNC_WAIT_CREA:
        // ADD TO REMOTE
        bulk.insert(preparNodeToUpdate(localNode));
        break;
      case SYNC_WAIT_UPT:
        // DELETE LOCAL - better to create remote ???
        _actions.remove.push(localNode);
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
