import _ from "lodash";

export { objectToTree };

// Thank you
// https://github.com/philipstanislaus/performant-array-to-tree/blob/master/src/arrayToTree.ts

function objectToTree(
  nodes = {},
  opts = { nodeId: "_id", parentId: "parent", root: "" }
) {
  const tree = [];
  const lookup = _.cloneDeep(nodes);

  Object.keys(lookup).forEach(key => {
    const node = lookup[key];
    const nodeId = node[opts.nodeId];
    lookup[nodeId].children = [];
  });

  Object.keys(lookup).forEach(key => {
    const node = lookup[key];
    const nodeId = node[opts.nodeId];
    const parentId = node[opts.parentId];

    //lookup[nodeId].children = [];
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
