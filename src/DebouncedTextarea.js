import React, { Component } from "react";
import debounce from "lodash/debounce";

class DebouncedTextarea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    const { onChange, value, time = 500 } = this.props;
    this.send = debounce(onChange, time);
    this.setState({ value: value || "" });
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.value);
    if (
      //this.props.targetId !== prevProps.targetId &&
      prevProps.value !== this.props.value
    ) {
      this.setState({ value: this.props.value || "" });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;

    this.setState({ value: value }, () => {
      this.send(value);
    });
  }

  render() {
    return (
      <textarea value={this.state.value} onChange={this.handleInputChange} />
    );
  }
}

export default DebouncedTextarea;
