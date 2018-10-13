import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./Login";
import Main from "./Main";
import Alert from "./Alert";
import Header from "./Header";
import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <Alert />
          <main>
            <Route exact path="/" component={Main} />
            <Route path="/login" component={Login} />
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
