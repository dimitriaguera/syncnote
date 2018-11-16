import React, { Component } from "react";
import { connect } from "react-redux";
import NodeItem from "./NodeItem";
import { objectToTree } from "./utils/tools";

class NodeListNoConnect extends Component {
  makeRowsRecursive(row, level) {
    const rows = [];
    // What level ?
    const nextLevel = ++level;
    // push the parent row first
    row.level = nextLevel;
    rows.push(row);

    let children = row.children;
    children.forEach(d => {
      rows.push(...this.makeRowsRecursive(d, nextLevel));
    });
    return rows;
  }

  makeRows(tree) {
    const rows = [];
    tree.forEach(d => {
      rows.push(...this.makeRowsRecursive(d, 0));
    });
    return rows;
  }

  render() {
    console.log("RENDER");
    const { nodes } = this.props;

    const tree = objectToTree(nodes);
    console.log(tree);
    const rows = this.makeRows(tree);

    return (
      <div className="list">
        <h1>List</h1>
        <h2>{rows.length} nodes count</h2>
        {rows.map(node => (
          <NodeItem key={node._id} node={node} level={node.level} />
        ))}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    nodes: state.nodes
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

const NodeList = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeListNoConnect);

export default NodeList;
