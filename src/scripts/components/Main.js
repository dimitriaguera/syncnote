import React from 'react';
import NodeList from './NodeList';
import Window from './Window';

const Main = React.memo(() => {
  console.log('RENDER MAIN');
  return (
    <div className="main-inner">
      <div className="main-navigation">
        <NodeList />
      </div>
      <div className="main-window">
        <Window />
      </div>
    </div>
  );
});

export default Main;
