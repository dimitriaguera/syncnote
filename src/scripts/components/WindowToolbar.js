import React from 'react';
import WindowToolbarTitle from './WindowToolbarTitle';
import WindowToolbarMode from './WindowToolbarMode';

const WindowToolbar = ({ name }) => {
  return (
    <div className="toolbar window-toolbar">
      <WindowToolbarTitle />
      <WindowToolbarMode />
    </div>
  )
}

export default WindowToolbar;