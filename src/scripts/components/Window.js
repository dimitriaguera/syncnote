import React, { Component } from 'react';
import { connect } from 'react-redux';
import WindowToolbar from './WindowToolbar';
import Textarea from './Textarea';
import Read from './Read';

class WindowNoConnect extends Component {
  render() {
    const { mode, _id } = this.props;
    const classes = `window mode-${mode}`;
    console.log('RENDER WINDOW');
    return (
      <div className={classes}>
        {_id && <WindowToolbar />}
        <div className="window-inner">
          {_id && (mode === 'edit' || mode === 'edit-read') && (
            <div className="window-edit">
              <Textarea />
            </div>
          )}
          {_id && (mode === 'read' || mode === 'edit-read') && (
            <div className="window-read">
              <Read />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    _id: state.windowNode._id,
    mode: state.windowNode.mode
  };
};

const Window = connect(mapStateToProps, null)(WindowNoConnect);

export default Window;
