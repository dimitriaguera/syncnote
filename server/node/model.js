const chalk = require('chalk');
const mongodb = require('../db/mongodb');
const uuidv1 = require('uuid/v1');
const _ = require('lodash');

module.exports = {
  init,
  nodeMerge,
  nodeFactory,
  preparNodeToUpdate,
  preparNodeToShare,
  isNodeOwner,
  isNodeShared
};

function init() {
  mongodb.getDb().createCollection('node', {}, function(err, results) {
    console.log('Collection node created.');
  });
}

function nodeFactory(data, user) {
  const { _id, _tId, name, parent, content, shared, created, updated } = data;

  if (!name) {
    const err = new Error('You must give a name.');
    err.statusCode = 400;
    throw err;
  }

  if (!user) {
    const err = new Error('You must be authenticated.');
    err.statusCode = 400;
    throw err;
  }

  return {
    _id: _id || uuidv1(),
    _tId: _tId,
    _rev: uuidv1(),
    name: name,
    owner: user._id,
    parent: parent || null,
    content: content || null,
    shared: shared || [],
    created: created || new Date(),
    updated: updated || null
  };
}

function nodeMerge(old, update) {
  if (!old) {
    const err = new Error('No node to update found.');
    err.statusCode = 400;
    throw err;
  }

  if (_.isEmpty(update)) {
    const err = new Error('Nothing to upate.');
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
  // Check basic info
  if (!update._id || !update._tId || _.isEmpty(update)) {
    const err = new Error('Nothing to update or no node Id or no node tId.');
    err.statusCode = 400;
    throw err;
  }

  // Remove client info
  delete update._sync_status;
  delete update._sync_wait;

  // Add needed info
  const _node = Object.assign(update, {
    _id: update._id,
    _tId: update._tId,
    _rev: uuidv1()
  });

  // Add date info if needed
  if (!_node.updated) {
    _node.updated = new Date();
  }

  console.log(chalk.yellow('PREPARED NODE TO UPDATE : '));
  console.log(_node);
  console.log(chalk.yellow('------------------------------'));

  return _node;
}

function preparNodeToShare(share, node) {
  // Check basic info
  if (!share._id || _.isEmpty(share)) {
    const err = new Error('Nothing to share or no node Id.');
    err.statusCode = 400;
    throw err;
  }

  // Ensure owner uid is not in shared array
  const _shared = share.shared.filter(uid => {
    return uid !== node.owner;
  });

  // Build update info
  const _update = {
    shared: _shared
  };

  console.log(chalk.yellow('PREPARED NODE TO SHARE : '));
  console.log(_update);
  console.log(chalk.yellow('------------------------------'));

  return _update;
}

function isNodeOwner(uid, node) {
  if (!uid || !node) {
    return false;
  }
  return uid === node.owner;
}

function isNodeShared(uid, node) {
  if (!uid || !node || !node.shared) {
    return false;
  }
  return node.shared.indexOf(uid) !== -1;
}
