import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { store } from "./services/store";
import { Provider } from "react-redux";
import Boot from "./Boot";
import "./services/socket";
import "./services/auth/auth.event";

ReactDOM.render(
  <Provider store={store}>
    <Boot />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
