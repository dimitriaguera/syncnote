import React, { Component } from "react";
import { connect } from "react-redux";
import { readThisNode } from "../redux/actions";
import { push } from "../services/sync/sync";

class NoteItemNoConnect extends Component {
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleTestRunner = this.handleTestRunner.bind(this);
  }

  handleBlur(e) {
    const value = e.target.value;
    const node = this.props.node;

    if (!value) return;
    e.target.value = "";

    const _action = {
      type: "update",
      data: {
        _id: node._id,
        name: value
      }
    };

    push(_action);
  }

  handleTestRunner(){

    const delay = 50;
    const loops = 100;
    
    let count = 0;

    const testID = setInterval(() => {
      if( count >=  loops ) {
        clearInterval(testID);
      }
      count ++;
      const node = this.props.node;
      const _action = {
        type: "update",
        data: {
          _id: node._id,
          _rev: node._rev,
          _sync_pool: node._sync_pool,
          name: `Loop ${count}`
        }
      };
      push(_action);
    }, delay);
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

  handleSelect(e) {
    const node = this.props.node;
    this.props.selectToWindow(node._id);
  }

  render() {
    const { node, level } = this.props;

    const classes = ["node-item", `node-status-${node._sync_status}`];

    return (
      <div
        className={classes.join(" ")}
        style={{ paddingLeft: `${(level - 1) * 20}px` }}
      >
        <button className="label" onClick={this.handleSelect}>
          {node.name}
        </button>
        <input type="text" onBlur={this.handleBlur} />
        <input type="button" value="Add" onClick={this.handleAdd} />
        <input type="button" value="X" onClick={this.handleRemove} />
        <input type="button" value="Test" onClick={this.handleTestRunner} />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return { selectToWindow: async _id => dispatch(await readThisNode(_id)) };
};

const NoteItem = connect(
  null,
  mapDispatchToProps
)(NoteItemNoConnect);

export default NoteItem;
