import React, { Component } from "react";
import { connect } from "react-redux";
import NodeItem from "./NodeItem";

class NodeListNoConnect extends Component {
  render() {
    console.log("RENDER");
    const { nodes } = this.props;

    return (
      <div className="list">
        <h1>List</h1>
        <ul>
          {Object.keys(nodes).map(key => (
            <li key={key} value={key}>
              <NodeItem node={nodes[key]} />
            </li>
          ))}
        </ul>
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
