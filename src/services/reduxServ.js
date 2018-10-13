import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../redux/reducers";

const composeEnhancers =
  process.env.NODE_ENV !== "production" &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

// Note: this API requires redux@>=3.1.0
export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);
