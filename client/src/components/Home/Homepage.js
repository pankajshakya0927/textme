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

  const handleLogin = () => {
    history.push("/login");
  };

  const handleSignup = () => {
    history.push("/signup");
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h1 className="mb-4 fw-bold">
        Welcome to <span className="text-primary">TextMe</span>!
      </h1>
      <p className="text-muted">
        Stay connected with your friends in real-time.
      </p>

      {isLoggedIn ? (
        <>
          <h5>
            Hi there!{" "}
            <span role="img" aria-label="wave" className="wave">
              👋
            </span>
          </h5>
          <Button variant="primary" className="mt-3 px-4 py-2" onClick={handleGoToChats}>
            Go to Chats <AiOutlineArrowRight />
          </Button>
        </>
      ) : (
        <div className="mt-3">
          <Button variant="primary" className="me-2 px-4 py-2" onClick={handleLogin}>
            Login
          </Button>
          <Button variant="outline-primary" className="px-4 py-2" onClick={handleSignup}>
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );
}