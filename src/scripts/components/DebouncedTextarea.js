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
    const { onChange, time = 500 } = this.props;
    this.send = debounce(onChange, time);
    this.setState({ value: this.props.value || '' });
  }

  componentDidUpdate( prevProps ) {
    if( prevProps._id !== this.props._id || prevProps.value !== this.props.value ){
      this.setState({ value: this.props.value || '' });
    }
  }

  handleInputChange(event) {
    const value = event.target.value;
    this.send(value);
    this.setState({ value });
  }

  render() {
    return (
      <textarea value={this.state.value} onChange={this.handleInputChange}></textarea>
    );
  }
}

export default DebouncedTextarea;
