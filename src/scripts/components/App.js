import React, { Component } from "react";
import { Route } from "react-router-dom";
import Login from "./Login";
import Main from "./Main";
import Alert from "./Alert";
import Header from "./Header";
import "../../App.scss";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <main>
          <Route exact path="/" component={Main} />
          <Route path="/login" component={Login} />
        </main>
        <Alert />
      </div>
    );
  }
}

export default App;
