import React from 'react';
import NodeAdd from './NodeAdd';

const NodeToolbar = React.memo(() => {
  console.log('RENDER MAIN');
  return (
    <div className="node-toolbar">
      <NodeAdd />
    </div>
  );
});

export default NodeToolbar;
