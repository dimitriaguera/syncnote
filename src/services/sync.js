import { populateLocalDb, updateLocalDb, getNodesToSync } from "./local-db";
import { get, post } from "./fetch";
import {
  SYNC_STATUS_OK,
  SYNC_STATUS_ADD,
  SYNC_STATUS_UPT,
  SYNC_STATUS_DEL
} from "../globals/_sync_status";
import socket from "../services/socket";

// Socket "s.on()" events registration.
// This is data entry point from remoteDB changes.
socket.eventRegister("pull", pullHandler);

// Get data from remote DB and populate localDB.
// This function is called during login phase.
// LocalDB nodes collection need to already be empty.
export const populateLocalDbFromRemote = async user => {
  const { data } = await get(`/node/${user._id}`);
  const result = await populateLocalDb(data, {
    sync: SYNC_STATUS_OK
  });
  return result;
};

// Main booter for sync process.
export const syncLocalDbToRemote = async () => {
  // @TODO: filtrer les nodes non synchronisés.
  // Get local nodes.
  const localNodes = await getNodesToSync();
  // Get remotes nodes.
  const { data: remoteNodes } = await get(`/sync`);
  // Determine actions to perform for each node.
  const actions = compareForSynchronize(remoteNodes, localNodes);
};

// Push new data to remoteDB.
export const push = async data => {
  try {
    // Update local indexDBbefore emtting to remote.
    // This is to allow working offline.
    updateLocalDb(data);
    //
    socket.emit("push", data, resp => {
      console.log("resp after push: ", resp);
      //@Todo : handle response to manage conflicts.
    });
  } catch (err) {
    console.log(err);
  }
};

export const push_bulk = async data => {
  const bulk = {
    update: [data]
  };
  socket.emit("push_bulk", bulk, resp => {
    console.log("resp after push: ", resp);
  });
};

async function pullHandler(data) {
  console.log("from pull: ", data);
  updateLocalDb(data);
}

// Compare local to remote and spread actions to perform.
function compareForSynchronize(remoteNodes, localNodes) {
  const local = arrayToObject(localNodes, "_id");
  const actions = {
    syncLocal: [],
    syncRemote: []
  };

  remoteNodes.forEach(remoteNode => {
    const localNode = local[remoteNode._id];
    // If remote node doesn't exit in local, create it.
    if (!localNode) {
      // CREATE IN LOCAL
      return;
    }
    // If no change in _rev id.
    if (remoteNode === localNode._rev) {
      switch (localNode._rev) {
        case SYNC_STATUS_OK:
          // NOTHING
          break;
        case SYNC_STATUS_ADD:
          // ADD TO REMOTE
          break;
        case SYNC_STATUS_UPT:
          // UPDT TO REMOTE
          break;
        case SYNC_STATUS_DEL:
          // DEL IN REMOTE
          break;
        default:
          break;
      }
    }

    // If changes in _rev id.
    else {
      switch (localNode._rev) {
        case SYNC_STATUS_OK:
          // UPDT TO LOCAL
          break;
        case SYNC_STATUS_ADD:
          // CONFLICT ID ALREADY EXIST
          break;
        case SYNC_STATUS_UPT:
          // CONFLICT MERGE REQUEST
          break;
        case SYNC_STATUS_DEL:
          // CONFLICT DEL NODE UPDATED
          break;
        default:
          break;
      }
    }
  });
}

function arrayToObject(array, key) {
  const obj = {};
  for (let i = 0, l = array.length; i < l; i++) {
    obj[array[i][key]] = array[i];
  }
  return obj;
}
