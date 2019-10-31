import React, { Component } from "react";
import { connect } from "react-redux";
import { set_window_read_mode, set_window_edit_mode, set_window_edit_read_mode } from "./redux/actions";
import NodeTextarea from "./NodeTextarea";
import NodeRead from "./NodeRead";

class NodeWindowNoConnect extends Component {

  render() {
    const { readMode, editMode, bothMode, mode } = this.props;
    const classes = `window mode-${mode}`;
    return (
      <div className={classes}>
        <div className="window-toolbar">
          <button onClick={readMode}>read</button>
          <button onClick={editMode}>edit</button>
          <button onClick={bothMode}>both</button>
        </div>
        {(mode === 'edit' || mode === 'edit-read') &&
        <div className="window-edit">
          <NodeTextarea />
        </div>
        }
        {(mode === 'read' || mode === 'edit-read') &&
        <div className="window-read">
          <NodeRead />
        </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    mode: state.windowNode.mode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    readMode: () => dispatch(set_window_read_mode()),
    editMode: () => dispatch(set_window_edit_mode()),
    bothMode: () => dispatch(set_window_edit_read_mode())
  };
};

const NodeWindow = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeWindowNoConnect);

export default NodeWindow;
