import uuidv1 from "uuid/v1";
import { getLocalUser } from "./session";

export const buildNode = (name, shared, parent = "") => {
  return {
    _id: uuidv1(),
    owner: getLocalUser()._id,
    parent: parent,
    name: name,
    shared: shared
  };
};

// Format nodes received from remote DB.
// Need to prepar before inserting in localDB :
// Adding _sync status values.
export const formatUploadedNodes = (data, opt = {}) => {
  const { sync } = opt;
  if (Array.isArray(data)) {
    return data.map(node => {
      return formatUploadedSoloNode(node, sync);
    });
  } else {
    return formatUploadedSoloNode(data, sync);
  }
};

// Format one node for localDB.
export const formatUploadedSoloNode = (node, sync) => {
  node._sync = sync;
  return node;
};
