export { arrayToTree, objectToTree };

// Thank you
// https://github.com/philipstanislaus/performant-array-to-tree/blob/master/src/arrayToTree.ts

function arrayToTree(
  nodes = [],
  opts = { nodeId: "_id", parentId: "parent", root: "" }
) {
  const tree = [];
  const lookup = {};

  for (let i = 0, l = nodes.length; i < l; i++) {
    const node = nodes[i];
    const nodeId = node[opts.nodeId];
    const parentId = node[opts.parentId];

    if (!Object.prototype.hasOwnProperty.call(lookup, nodeId)) {
      lookup[nodeId] = { data: null, children: [] };
    }

    lookup[nodeId].data = node;

    const treeNode = lookup[nodeId];

    if (parentId === opts.root) {
      tree.push(treeNode);
    } else {
      if (!Object.prototype.hasOwnProperty.call(lookup, parentId)) {
        lookup[parentId] = { data: null, children: [] };
      }
      lookup[parentId].children.push(treeNode);
    }
  }

  return tree;
}

function objectToTree(
  nodes = {},
  opts = { nodeId: "_id", parentId: "parent", root: "" }
) {
  const tree = [];
  const lookup = Object.assign({}, nodes);

  console.log("LOOKUP : ", lookup);

  Object.keys(lookup).forEach(key => {
    const node = lookup[key];
    const nodeId = node[opts.nodeId];
    const parentId = node[opts.parentId];

    lookup[nodeId].children = [];
    const treeNode = lookup[nodeId];

    if (parentId === opts.root) {
      tree.push(treeNode);
    } else {
      if (!Object.prototype.hasOwnProperty.call(lookup, parentId)) {
        console.log(`No parent found for node ${node.name}`);
        tree.push(treeNode);
      } else {
        lookup[parentId].children.push(treeNode);
      }
    }
  });

  return tree;
}
