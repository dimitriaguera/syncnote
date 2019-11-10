import React, { Component } from 'react';
import { connect } from 'react-redux';

class AlertNoConnect extends Component {
  render() {
    const { type, message } = this.props.alert;
    return (
      <div className={`alert alert-${type}`}>
        <p>{JSON.stringify(message)}</p>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    alert: state.alert
  };
};

const Alert = connect(mapStateToProps, null)(AlertNoConnect);

export default Alert;
