import React, { Component } from "react";
import { push } from "./services/sync/sync";

class NoteItem extends Component {
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }

  handleBlur(e) {
    const value = e.target.value;
    const node = this.props.node;

    if (!value) return;
    e.target.value = "";

    const _action = {
      type: "update",
      data: { ...node, name: value }
    };

    push(_action);
  }

  handleAdd(e) {
    const { name, _id } = this.props.node;
    const childName = `Child of ${name}`;
    push({ type: "add", data: { name: childName, parent: _id } });
    e.preventDefault();
  }

  handleRemove(e) {
    const node = this.props.node;
    const _action = { type: "remove", data: node };

    push(_action);
  }

  render() {
    const { node, level } = this.props;

    const classes = ["node-item", `node-status-${node._sync_status}`];

    return (
      <div
        className={classes.join(" ")}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <label>{node.name}</label>
        <input type="text" onBlur={this.handleBlur} />
        <input type="button" value="Add" onClick={this.handleAdd} />
        <input type="button" value="X" onClick={this.handleRemove} />
      </div>
    );
  }
}

export default NoteItem;
