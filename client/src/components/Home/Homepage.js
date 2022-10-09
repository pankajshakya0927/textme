import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import Button from "react-bootstrap/Button";
import { AiOutlineArrowRight } from "react-icons/ai";

import { AuthContext } from "../../context/AuthContext";

export default function Homepage() {
  const { isLoggedIn } = useContext(AuthContext);
  const history = useHistory();

  const handleGoToChats = () => {
    history.push("/chats");
  };

  return (
    <div className="container">
      {isLoggedIn ? (
        <h5>
          Hi there!{" "}
          <span role="img" aria-label="wave" className="wave">
            👋
          </span>{" "}
          Welcome to TextMe!!! <br />
          <Button variant="primary" className="mt-3" onClick={handleGoToChats}>
            Go to Chats <AiOutlineArrowRight />
          </Button>
        </h5>
      ) : (
        <h5>
          Hi there!{" "}
          <span role="img" aria-label="wave" className="wave">
            👋
          </span>{" "}
          Welcome to TextMe!!!
        </h5>
      )}
    </div>
  );
}
