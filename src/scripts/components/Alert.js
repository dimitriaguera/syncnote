import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

class AlertNoConnect extends PureComponent {
  render() {
    const { type, message } = this.props.alert;

    return type ? (
      <div className={`alert alert-${type}`}>
        <p>{JSON.stringify(message)}</p>
      </div>
    ) : null;
  }
}

const mapStateToProps = state => {
  return {
    alert: state.alert
  };
};

const Alert = connect(mapStateToProps, null)(AlertNoConnect);

export default Alert;
