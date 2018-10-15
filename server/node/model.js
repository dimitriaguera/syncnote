const mongodb = require("../db/mongodb");
const uuidv1 = require("uuid/v1");
const _ = require("lodash");

module.exports = {
  init,
  nodeMerge,
  nodeFactory,
  preparNodeToUpdate
};

function init() {
  mongodb.getDb().createCollection(
    "node",
    {
      capped: true,
      size: 100000,
      max: 5000
    },
    function(err, results) {
      console.log("Collection node created.");
    }
  );
}

function nodeFactory(data, user) {
  const { name, parent, shared } = data;

  if (!name) {
    const err = new Error("You must give a name.");
    err.statusCode = 400;
    throw err;
  }

  if (!user) {
    const err = new Error("You must be authenticated.");
    err.statusCode = 400;
    throw err;
  }

  return {
    _id: uuidv1(),
    name: name,
    owner: user._id,
    parent: parent || null,
    shared: shared || [],
    _rev: uuidv1()
  };
}

function nodeMerge(old, update) {
  if (!old) {
    const err = new Error("No node to update found.");
    err.statusCode = 400;
    throw err;
  }

  if (_.isEmpty(update)) {
    const err = new Error("Nothing to upate.");
    err.statusCode = 400;
    throw err;
  }

  delete update._id;
  update._rev = uuidv1();

  if (update.shared) {
    delete old.shared;
  }

  return _.merge(old, update);
}

function preparNodeToUpdate(update) {
  if (!update._id || _.isEmpty(update)) {
    const err = new Error("Nothing to update or no node Id.");
    err.statusCode = 400;
    throw err;
  }

  const _node = Object.assign({}, update);
  _node._rev = uuidv1();

  return _node;
}
