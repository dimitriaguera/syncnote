import React, { Component } from 'react';
import { connect } from 'react-redux';
import { login } from '../redux/actions';

class LoginNoConnect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async handleSubmit(event) {
    const { password, username } = this.state;
    try {
      this.props.loginHandler(password, username);
    } catch (err) {
      console.log('From Component: ', err);
    }

    event.preventDefault();
  }
  render() {
    return (
      <div className="login">
        <h1>Login</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Username:
            <input
              name="username"
              type="text"
              value={this.state.username}
              onChange={this.handleInputChange}
            />
          </label>
          <label>
            Password:
            <input
              name="password"
              type="text"
              value={this.state.password}
              onChange={this.handleInputChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loginHandler: (u, p) => dispatch(login(u, p))
  };
};

const Login = connect(null, mapDispatchToProps)(LoginNoConnect);

export default Login;
