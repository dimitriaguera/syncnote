import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout, mode_online, mode_offline } from '../redux/actions';

class HeaderNoConnect extends Component {
  render() {
    const { user, loggedIn } = this.props.auth;
    return (
      <header className="header">
        <nav>
          <span className="icon-activity"></span>
          <button onClick={this.props.setOnline}>Connect</button>
          <button onClick={this.props.setOffline}>Disconnect</button>
          <span>ONLINE STATUS: {this.props.mode.id}</span>
          <Link to="/">Home</Link>
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
        </nav>
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
