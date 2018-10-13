import React, { Component } from "react";
import { connect } from "react-redux";

class ListNodeNoConnect extends Component {
  render() {
    console.log("RENDER");
    const { nodes } = this.props;

    return (
      <div className="list">
        <h1>List</h1>
        <ul>
          {Object.keys(nodes).map(key => (
            <option value={key}>{nodes[key].name}</option>
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

const ListNode = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListNodeNoConnect);

export default ListNode;
