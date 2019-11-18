const _ = require('lodash');
const { getAllNodes } = require('../node/controller');

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
      console.log('Error init node broker: ', err);
    }
  },

  get: nId => {
    return USERS_NODES_CONCERN[nId] || [];
  },

  update: (nId, updates, owner) => {
    const oldCuIds = USERS_NODES_CONCERN[nId] || [];

    const cuIds = updateConcernedUsersIds({
      shared: updates.shared,
      owner: owner
    });

    const filtered_cuids = {
      removed_cuids: _.difference(oldCuIds, cuIds),
      added_cuids: _.difference(cuIds, oldCuIds),
      updated_cuids: _.intersection(oldCuIds, cuIds)
    };

    USERS_NODES_CONCERN[nId] = cuIds;
    console.log('UPDATE BROKER : ', USERS_NODES_CONCERN, filtered_cuids);

    return filtered_cuids;
  },

  store: node => {
    const cuIds = extractConcernedUsersIds(node);
    USERS_NODES_CONCERN[node._id] = cuIds;
    console.log('STORE BROKER : ', USERS_NODES_CONCERN);
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
  const cuIds = [...updates.shared] || [];
  if (updates.owner && cuIds.indexOf(updates.owner) === -1) {
    cuIds.push(updates.owner);
  }
  return cuIds;
}

function extractConcernedUsersIds(node) {
  const cuIds = node.shared.slice(0);
  cuIds.push(node.owner);
  return cuIds;
}
