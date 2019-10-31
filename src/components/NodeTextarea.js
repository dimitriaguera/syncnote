import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "../services/sync/sync";
import DebouncedTextarea from "./DebouncedTextarea";

class NodeTextareaNoConnect extends Component {
  constructor(props) {
    super(props);
    this.sendContentChange = this.sendContentChange.bind(this);
  }

  sendContentChange(value) {
    const { display } = this.props;
    // Prevent sending data without node selected.
    if (!display._id) {
      return null;
    }

    const _action = {
      type: "update",
      data: { _id: display._id, content: value }
    };

    push(_action);
  }

  render() {
    const { display } = this.props;

    return (
      <div className="node-edit">
        { display._id &&
        <DebouncedTextarea
          value={display.content}
          targetId={display._id}
          onChange={this.sendContentChange}
          time={100}
        />
        }
        {display.conflicts && (
          <div>{JSON.stringify(display.conflicts)}</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    display: state.windowNode
  };
};


const NodeTextarea = connect(
  mapStateToProps,
  null
)(NodeTextareaNoConnect);

export default NodeTextarea;
