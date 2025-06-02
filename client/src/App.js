import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import ChatTabs from "./components/ChatTabs/ChatTabs";
import NavbarOffCanvas from "./components/Navbar/Navbar";
import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";
import AnonymousChatRoom from "./components/AnonymousChatRoom/AnonymousChatRoom";

import { FriendsContextProvider } from "./context/FriendsContext";
import { NotificationsContextProvider } from "./context/NotificationsContext";
import { UsersContextProvider } from "./context/UsersContext";
import "./App.css";
import Homepage from "./components/Home/Homepage";

function App() {
  return (
    <NotificationsContextProvider>
      <FriendsContextProvider>
        <UsersContextProvider>
          <Router>
            <div className="app-main-layout">
              <NavbarOffCanvas />
              <div className="app-content">
                <Switch>
                  <Route exact path="/" component={Homepage} />
                  <Route exact path="/signup" component={Signup} />
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/chats" component={ChatTabs} />
                  <Route path="/chatroom/:roomName" component={AnonymousChatRoom} />
                </Switch>
              </div>
            </div>
          </Router>
        </UsersContextProvider>
      </FriendsContextProvider>
    </NotificationsContextProvider>
  );
}

export default App;