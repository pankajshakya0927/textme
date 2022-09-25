import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import ChatTabs from "./components/ChatTabs/ChatTabs";
import NavbarOffCanvas from "./components/Navbar/Navbar";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import "./App.css";

function App() {
  return (
    <Router>
      <NavbarOffCanvas />
      <Route exact path="/signup" component={Signup}>
        <Signup />
      </Route>
      <Route exact path="/login" component={Login}>
        <Login />
      </Route>
      <Route exact path="/" component={ChatTabs}>
        <ChatTabs />
      </Route>
    </Router>
  );
}

export default App;
