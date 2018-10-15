import React, { Component } from "react";
import { Route } from "react-router-dom";
import Login from "./Login";
import Main from "./Main";
import Alert from "./Alert";
import Header from "./Header";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Alert />
        <main>
          <Route exact path="/" component={Main} />
          <Route path="/login" component={Login} />
        </main>
      </div>
    );
  }
}

export default App;
