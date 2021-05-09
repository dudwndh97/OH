import React from "react";
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Home from './components/pages/Home/Home';
import Login from './components/pages/Login/Login';
import Signin from './components/pages/Signin/Signin';

import NavBar from './components/session/NavBar';


function App() {
  return (
    <Router>
      <div className="App">
        <NavBar/>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/signin">
            <Signin />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
