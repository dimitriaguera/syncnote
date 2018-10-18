import React, { Component } from "react";
import NodeAdd from "./NodeAdd";
import NodeList from "./NodeList";

class List extends Component {
  render() {
    return (
      <div className="main">
        <NodeAdd />
        <NodeList />
      </div>
    );
  }
}

export default List;
