const mongodb = require('../db/mongodb');
const { nodeFactory, nodeMerge } = require('./model');

module.exports = {
  routerGetAllUserNode,
  routerPost,
  routerPut,
  routerDeleteNode,
  getNodeById,
  getAllNodes,
  getNodeByUserId,
  addNode,
  updateNodeById,
  deleteNodeById
};

async function routerPost(req, res) {
  const _node = nodeFactory(req.body, req.user);
  const data = await addNode(_node);
  res.json({ success: true, data: data });
}

async function routerPut(req, res) {
  const node = nodeMerge(req._currentNode, req.body);
  const data = await updateNodeById(req._currentNode._id, node);
  res.json({ success: true, data: data });
}

async function routerDeleteNode(req, res) {
  const data = await deleteNodeById(req._nodeId);
  res.json({ success: true, data: data });
}

async function routerGetAllUserNode(req, res) {
  const data = await getNodeByUserId(req._userId);
  res.json(data);
}

async function getAllNodes() {
  return await mongodb
    .getDb()
    .collection('node')
    .find()
    .toArray();
}

async function getNodeByUserId(userId) {
  return await mongodb
    .getDb()
    .collection('node')
    .find({ $or: [{ owner: userId }, { shared: { $all: [userId] } }] })
    .toArray();
}

async function getNodeById(id) {
  return await mongodb
    .getDb()
    .collection('node')
    .findOne({ _id: id });
}

async function addNode(node) {
  return await mongodb
    .getDb()
    .collection('node')
    .insertOne(node);
}

async function updateNodeById(id, update) {
  return await mongodb
    .getDb()
    .collection('node')
    .updateOne({ _id: id }, { $set: update }, { upsert: false });
}

async function deleteNodeById(nodeId) {
  return await mongodb
    .getDb()
    .collection('node')
    .deleteOne({ _id: nodeId });
}
