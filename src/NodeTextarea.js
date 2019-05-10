import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "./services/sync/sync";
import DebouncedTextarea from "./DebouncedTextarea";
import { set_window_read_mode, set_window_edit_mode } from "./redux/actions";

class NodeTextareaNoConnect extends Component {
  constructor(props) {
    super(props);
    this.sendContentChange = this.sendContentChange.bind(this);
    this.toggleDisplayMode = this.toggleDisplayMode.bind(this);
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

  toggleDisplayMode() {
    const { display, readMode, editMode } = this.props;
    if (display.mode === "read") {
      editMode();
    } else {
      readMode();
    }
  }

  renderEditZone() {
    const { display } = this.props;
    if (!display._id) {
      return null;
    }
    if (display._id && display.mode === "edit") {
      return (
        <div>
          <div>
            <button onClick={this.toggleDisplayMode}>READ</button>
          </div>
          <div>
            <DebouncedTextarea
              value={display.content}
              targetId={display._id}
              onChange={this.sendContentChange}
              time={500}
            />
            {display.conflicts && (
              <div>{JSON.stringify(display.conflicts)}</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div>
          <button onClick={this.toggleDisplayMode}>EDIT</button>
        </div>
        <div>
          <p>{display.content}</p>
        </div>
      </div>
    );
  }

  render() {
    return <div>{this.renderEditZone()}</div>;
  }
}

const mapStateToProps = state => {
  return {
    display: state.windowNode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    readMode: () => dispatch(set_window_read_mode()),
    editMode: () => dispatch(set_window_edit_mode())
  };
};

const NodeTextarea = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeTextareaNoConnect);

export default NodeTextarea;
