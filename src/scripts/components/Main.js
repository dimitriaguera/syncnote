import React, { Component } from "react";
import NodeAdd from "./NodeAdd";
import NodeList from "./NodeList";
import Window from "./Window";

class List extends Component {
  render() {
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
  }
}

export default List;
