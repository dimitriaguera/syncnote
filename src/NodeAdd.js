import React, { Component } from "react";
import { push } from "./services/sync/sync";
//import { buildNode } from "./services/node-factory";

class NodeAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      shared: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async handleSubmit(event) {
    const { name, shared } = this.state;
    let s = shared.split(",");
    console.log('SHARED :', s);
    s = !s[0] ? [] : s;
    if (!name) return;
    //const node = buildNode(name, s);
    push({
      type: "add",
      data: { name: name },
      shared: s,
    });
    event.preventDefault();
  }
  render() {
    return (
      <div className="add-node">
        <h1>Add node</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Node name:
            <input
              name="name"
              type="text"
              value={this.state.name}
              onChange={this.handleInputChange}
            />
          </label>
          <label>
            SharedId:
            <input
              name="shared"
              type="text"
              value={this.state.shared}
              onChange={this.handleInputChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default NodeAdd;
