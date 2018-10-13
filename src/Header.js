import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "./redux/actions";

class HeaderNoConnect extends Component {
  render() {
    const { user, loggedIn } = this.props.auth;
    return (
      <header className="App-header">
        <nav>
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
    auth: state.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    logoutHandler: () => dispatch(logout)
  };
};

const Header = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderNoConnect);

export default Header;
