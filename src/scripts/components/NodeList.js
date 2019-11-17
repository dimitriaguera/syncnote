import React, { Component } from 'react';
import { connect } from 'react-redux';
import NodeItem from './NodeItem';
import { objectToTree } from '../utils/tools';

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
    console.log('RENDER NODE LIST');
    const { nodes } = this.props;

    const tree = objectToTree(nodes);
    const rows = this.makeRows(tree);

    return (
      <div className="list">
        {rows.map(node => (
          <NodeItem
            key={node._id}
            level={node.level}
            name={node.name}
            _id={node._id}
            _sync_status={node._sync_status}
          />
        ))}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    nodes: state.treeNode
  };
};

const NodeList = connect(mapStateToProps, null)(NodeListNoConnect);

export default NodeList;
