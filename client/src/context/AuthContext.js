import React, { createContext, useState } from "react";
import Utils from "../shared/Utils";

export const AuthContext = createContext([]);

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  // reloading page loses isLoggedIn context value therefore, check for isLoggedIn stored in localStorage
  if (!isLoggedIn && Utils.getItemFromLocalStorage("isLoggedIn")) {
    const current_user = JSON.parse(Utils.getItemFromLocalStorage("current_user"));
    setIsLoggedIn(true);
    setUsername(current_user.username);
  }

  return (
  <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, username}}>
    {props.children}
  </AuthContext.Provider>
  );
};