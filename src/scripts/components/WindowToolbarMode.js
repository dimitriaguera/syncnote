import React from "react";
import { connect } from "react-redux";
import { set_window_read_mode, set_window_edit_mode, set_window_edit_read_mode } from "../redux/actions";

const WindowToolbarModeNoConnect = ({ readMode, editMode, bothMode, mode }) => {
  return (
    <div className={`window-toolbar-mode mode-${mode}`}>
      <button onClick={readMode}>read</button>
      <button onClick={editMode}>edit</button>
      <button onClick={bothMode}>both</button>
    </div>
  );
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

const WindowToolbarMode = connect(
  mapStateToProps,
  mapDispatchToProps
)(WindowToolbarModeNoConnect);

export default WindowToolbarMode;
