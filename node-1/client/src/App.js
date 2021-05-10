import React from "react";
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { useState, useEffect } from 'react';

import Home from './components/pages/Home/Home';
import Login from './components/pages/Login/Login';
import Signin from './components/pages/Signin/Signin';


import NavBar from './components/session/NavBar';


function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }); // deps가 생략되어 있기때문에 리렌더링(state가 바뀔 때 마다. 실행된다.)
  return (
    <>
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
    <div>
      <p>당신은 {count}번 클릭했습니다 </p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
    </>
  );
}

export default App;
