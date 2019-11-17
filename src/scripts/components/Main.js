import React from 'react';
import NodeAdd from './NodeAdd';
import NodeList from './NodeList';
import Window from './Window';

const Main = React.memo(() => {
  console.log('RENDER MAIN');
  return (
    <div className="main">
      <div className="main-navigation">
        <div className="toolbar navigation-header">
          <NodeAdd />
        </div>
        <NodeList />
      </div>
      <div className="main-window">
        <Window />
      </div>
    </div>
  );
});

export default Main;
