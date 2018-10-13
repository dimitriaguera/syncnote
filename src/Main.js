import React, { Component } from "react";
import FormNode from "./FormNode";
import ListNode from "./ListNode";

class List extends Component {
  render() {
    return (
      <div className="main">
        <FormNode />
        <ListNode />
      </div>
    );
  }
}

export default List;
