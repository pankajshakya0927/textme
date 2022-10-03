import React, { createContext, useState } from "react";
import Utils from "../shared/Utils";

export const AuthContext = createContext([]);

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // reloading page loses isLoggedIn context value therefore, check for isLoggedIn stored in localStorage
  if (!isLoggedIn && Utils.getItemFromLocalStorage("isLoggedIn")) {
    setIsLoggedIn(true);
  }

  return (
  <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
    {props.children}
  </AuthContext.Provider>
  );
};