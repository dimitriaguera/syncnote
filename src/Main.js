import React, { Component } from "react";
import NodeAdd from "./NodeAdd";
import NodeList from "./NodeList";
import NodeWindow from "./NodeWindow";

class List extends Component {
  render() {
    return (
      <div className="main">
        <NodeAdd />
        <NodeList />
        <NodeWindow />
      </div>
    );
  }
}

export default List;
