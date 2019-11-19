import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { popoverContainer } from './Popover';
import Login from './Login';
import Main from './Main';
import Alert from './Alert';
import Header from './Header';
import '../../App.scss';

const App = () => {
  console.log('RENDER APP');
  return (
    <div className="App">
      <Header />
      <main>
        <div class="main">
          <Switch>
            <Route exact path="/">
              <Main />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
          </Switch>
        </div>
      </main>
      <Alert />
    </div>
  );
};

export default popoverContainer(App);
