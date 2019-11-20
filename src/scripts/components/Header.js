import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout, mode_online, mode_offline } from '../redux/actions';
import NodeToolbar from './NodeToolbar';

class HeaderNoConnect extends Component {
  render() {
    const { user, loggedIn } = this.props.auth;
    console.log('RENDER HEADER');
    return (
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <NodeToolbar />
          </div>
          <div className="header-right">
            <div className="header-nav">
              {/* <span className="icon-activity"></span>
          <button onClick={this.props.setOnline}>Connect</button>
          <button onClick={this.props.setOffline}>Disconnect</button>
          <span>ONLINE STATUS: {this.props.mode.id}</span> */}
              <Link to="/">Home</Link>
            </div>
            <div className="header-user">
              {loggedIn ? (
                <span>
                  <span>{user.username}</span>
                  <a href="#js" onClick={this.props.logoutHandler}>
                    Logout
                  </a>
                </span>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth,
    mode: state.mode
  };
};

const mapDispatchToProps = dispatch => {
  return {
    logoutHandler: () => dispatch(logout),
    setOnline: () => dispatch(mode_online()),
    setOffline: () => dispatch(mode_offline())
  };
};

const Header = connect(mapStateToProps, mapDispatchToProps)(HeaderNoConnect);

export default Header;
