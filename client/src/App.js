import "./App.css";
import ChatTabs from "./components/ChatTabs/ChatTabs";
import NavbarScroll from "./components/Navbar/NavbarScroll";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";

function App() {
  return (
    <Router>
      <NavbarScroll />
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
