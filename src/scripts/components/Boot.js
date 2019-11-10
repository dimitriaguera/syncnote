/**
 * Boot component permit to threat async actions before calling App,
 * for exemple to check if token exist on sessionStorage,
 * and set store to authenticated.
 */

import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';

//import { Loader } from 'semantic-ui-react'
import { initialize } from '../services/initialize';
import App from './App';

class Boot extends Component {
  constructor() {
    super();

    // Application's tags
    this.application = (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Loader's tags
    this.onBoot = (
      //<Loader active />
      <p>loading....</p>
    );
  }

  // Start boot process.
  componentWillMount() {
    initialize();
  }

  render() {
    const { bootStatus } = this.props.boot;
    // If boot session end, call App.
    // Else, call Loader.
    if (bootStatus === 2 || bootStatus === 3) {
      return this.application;
    } else {
      return this.onBoot;
    }
  }
}

const mapStateToProps = state => {
  return {
    boot: state.boot
  };
};

export default connect(mapStateToProps)(Boot);
