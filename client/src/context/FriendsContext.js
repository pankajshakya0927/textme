import React, { createContext, useState } from "react";

export const FriendsContext = createContext([]);

export const FriendsContextProvider = (props) => {
  const [updatedFriends, setUpdatedFriends] = useState(null);

  return (
  <FriendsContext.Provider value={{updatedFriends, setUpdatedFriends}}>
    {props.children}
  </FriendsContext.Provider>
  );
};

