const mongodb = require("../db/mongodb");
const { nodeFactory, nodeMerge } = require("./model");

module.exports = {
  getAllUserNode,
  post,
  put,
  deleteNode,
  getNodeById
};

async function post(req, res) {
  const _node = nodeFactory(req.body, req.user);
  const data = await mongodb
    .getDb()
    .collection("node")
    .insertOne(_node);
  res.json({ success: true, data: data });
}

async function put(req, res) {
  const node = nodeMerge(req._currentNode, req.body);
  const data = await updateNodeById(req._currentNode._id, node);
  res.json({ success: true, data: data });
}

async function deleteNode(req, res) {
  const data = await deleteNodeById(req._nodeId);
  res.json({ success: true, data: data });
}

async function getAllUserNode(req, res) {
  const data = await getNodeByUserId(req._userId);
  res.json(data);
}

async function getNodeByUserId(userId) {
  return await mongodb
    .getDb()
    .collection("node")
    .find({ $or: [{ owner: userId }, { shared: { $all: [userId] } }] })
    .toArray();
}

async function getNodeById(id) {
  return await mongodb
    .getDb()
    .collection("node")
    .findOne({ _id: id });
}

async function updateNodeById(id, update) {
  return await mongodb
    .getDb()
    .collection("node")
    .replaceOne({ _id: id }, update);
}

async function deleteNodeById(nodeId) {
  return await mongodb
    .getDb()
    .collection("node")
    .deleteOne({ _id: nodeId });
}
