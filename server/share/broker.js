const { getAllNodes } = require("../node/controller");

const USERS_NODES_CONCERN = {};

module.exports = {
  init: async () => {
    try {
      // Get all  nodes.
      const nodes = await getAllNodes();

      // Store all users concerned by nodes Ids.
      nodes.forEach(node => {
        USERS_NODES_CONCERN[node._id] = extractConcernedUsersIds(node);
      });

      // Message in the bottle.
      console.log(`Node broker initialized with ${nodes.length} nodes.`);
    } catch (err) {
      console.log("Error init node broker: ", err);
    }
  },

  get: nId => {
    return USERS_NODES_CONCERN[nId] || [];
  },

  update: (nId, updates) => {
    if (updates.shared || updates.owner) {
      const cuIds = updateConcernedUsersIds(updates);
      USERS_NODES_CONCERN[nId] = cuIds;
      console.log("update broker: ", USERS_NODES_CONCERN);
      return cuIds;
    }
    return null;
  },

  store: node => {
    const cuIds = extractConcernedUsersIds(node);
    USERS_NODES_CONCERN[node._id] = cuIds;
    console.log("store broker: ", USERS_NODES_CONCERN);
    return cuIds;
  },

  delete: nId => {
    const cuIds = USERS_NODES_CONCERN[nId];
    delete USERS_NODES_CONCERN[nId];
    return cuIds;
  },

  isConcerned: (nId, uId) => {
    const cuIds = USERS_NODES_CONCERN[nId] || [];
    return cuIds.indexOf(uId) > -1;
  }
};

function updateConcernedUsersIds(updates) {
  const cuIds = updates.shared || [];
  if (updates.owner) {
    cuIds.push(updates.owner);
  }
  return cuIds;
}

function extractConcernedUsersIds(node) {
  const cuIds = node.shared.slice(0);
  cuIds.push(node.owner);
  return cuIds;
}
