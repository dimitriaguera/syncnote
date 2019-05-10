import React, { Component } from "react";
import NodeTextarea from "./NodeTextarea";

class NodeWindow extends Component {
  render() {
    return (
      <div className="window">
        <NodeTextarea onChange={this.handleInputChange} />
      </div>
    );
  }
}

export default NodeWindow;
