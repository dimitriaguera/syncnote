import React, { Component } from "react";
import FormNode from "./FormNode";
import NodeList from "./NodeList";

class List extends Component {
  render() {
    return (
      <div className="main">
        <FormNode />
        <NodeList />
      </div>
    );
  }
}

export default List;
