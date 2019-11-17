import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from '../services/sync/sync';

class WindowToolbarTitleNoConnect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name || ''
    };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps._id !== this.props._id ||
      prevProps.name !== this.props.name
    ) {
      this.setState({ name: this.props.name });
    }
  }

  handleChange(e) {
    e.preventDefault();
    const value = e.target.value || '';
    if (value !== this.props.name) {
      this.setState({ name: value });
    }
  }

  handleBlur(e) {
    const { _id } = this.props;

    // Prevent sending data without node selected.
    if (!_id || !this.state.name) {
      return null;
    }

    // Prevent sending if same value
    if (this.props.name === this.state.name) {
      return null;
    }

    const _action = {
      type: 'update',
      data: { _id: _id, name: this.state.name }
    };

    push(_action);
  }

  render() {
    const { name } = this.state;
    console.log('RENDER TITLE');
    return (
      <input
        type="text"
        value={name}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    _id: state.windowNode._id,
    name: state.windowNode.name
  };
};

const WindowToolbarTitle = connect(
  mapStateToProps,
  null
)(WindowToolbarTitleNoConnect);

export default WindowToolbarTitle;
