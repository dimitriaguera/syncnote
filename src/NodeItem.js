import React, { Component } from "react";
import { push } from "./services/sync";

class NoteItem extends Component {
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleBlur(event) {
    const value = event.target.value;
    if (!value) return;
    event.target.value = "";
    const update = Object.assign(this.props.node, { name: value });
    push(update);
  }

  render() {
    const { node } = this.props;

    return (
      <div className="node-item">
        <label>{node.name}</label>
        <input type="text" onBlur={this.handleBlur} />
      </div>
    );
  }
}

export default NoteItem;
