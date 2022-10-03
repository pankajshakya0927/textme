import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import ChatTabs from "./components/ChatTabs/ChatTabs";
import NavbarOffCanvas from "./components/Navbar/Navbar";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";

import { FriendsContextProvider } from "./context/FriendsContext";
import "./App.css";

function App() {
  return (
    <FriendsContextProvider>
      <Router>
        <NavbarOffCanvas />
        <Switch>
          <Route exact path="/signup" component={Signup}>
            <Signup />
          </Route>
          <Route exact path="/login" component={Login}>
            <Login />
          </Route>
          <Route exact path="/chats" component={ChatTabs}>
            <ChatTabs />
          </Route>
        </Switch>
      </Router>
    </FriendsContextProvider>
  );
}

export default App;
