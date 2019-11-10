import React, { Component } from 'react';
import { push } from '../services/sync/sync';

class NodeAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 1
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    event.preventDefault();
    push({
      type: 'add',
      data: { name: `Note ${this.state.index}` }
    });
    this.setState({ index: this.state.index + 1 });
  }

  render() {
    return (
      <button onClick={this.onClick} className="add-node">
        Nouvelle note
      </button>
    );
  }
}

export default NodeAdd;
