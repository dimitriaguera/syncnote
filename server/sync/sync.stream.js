const broker = require("../share/broker");
const { emitToConcernedUsers } = require("../socket/manager");
const { _nodeStream } = require("../node/stream");

module.exports = {
  registerToNodesStream: io => {
    let cuIds;

    // register to remote DB change stream.
    // First handle changes to update broker state.
    _nodeStream().on("change", data => {
      switch (data.operationType) {
        case "insert":
          broker.store(data.fullDocument);
          cuIds = broker.get(data.documentKey._id);
          break;
        case "update":
          broker.update(
            data.documentKey._id,
            data.updateDescription.updatedFields
          );
          cuIds = broker.get(data.documentKey._id);
          break;
        case "replace":
          broker.update(data.documentKey._id, data.fullDocument);
          cuIds = broker.get(data.documentKey._id);
          break;
        case "delete":
          cuIds = broker.delete(data.documentKey._id);
          break;
        default:
          cuIds = [];
          break;
      }

      // Then emit changes to all concerned users sockets.
      // The handler emit changes on room "sync_change" to sockets clients if concerned.
      console.log("TRUE DATA change emit: ", data);
      emitToConcernedUsers(io, "sync_change", cuIds, data);
    });
  }
};
