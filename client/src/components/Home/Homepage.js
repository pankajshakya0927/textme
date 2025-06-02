import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { AiOutlineArrowRight } from "react-icons/ai";
import { AuthContext } from "../../context/AuthContext";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { v4 as uuidv4 } from "uuid";

export default function Homepage() {
  const { isLoggedIn } = useContext(AuthContext);
  const history = useHistory();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomNameError, setRoomNameError] = useState("");

  const handleGoToChats = () => {
    history.push("/chats");
  };

  const handleLogin = () => {
    history.push("/login");
  };

  const handleSignup = () => {
    history.push("/signup");
  };

  const handleAnonymousChat = () => {
    setShowRoomModal(true);
    setRoomName("");
    setRoomNameError("");
  };

  const handleRoomNameSubmit = (e) => {
    e.preventDefault();
    let name = roomName.trim();
    if (name && /\s/.test(name)) {
      setRoomNameError("No spaces allowed in room name");
      return;
    }
    if (!name) {
      name = uuidv4().slice(0, 8);
    }
    setRoomNameError("");
    setShowRoomModal(false);
    history.push(`/chatroom/${name}`);
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <h1 className="mb-4 fw-bold">
        Welcome to <span className="text-primary">TextMe</span>!
      </h1>
      <p className="text-muted">
        Stay connected with your friends in real-time.
      </p>

      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter a Room Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRoomNameSubmit}>
            <Form.Group controlId="anonRoomName">
              <Form.Label>Room Name (no spaces allowed, leave blank for random)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter room name"
                value={roomName}
                autoFocus
                onChange={e => {
                  setRoomName(e.target.value.replace(/\s/g, ""));
                  setRoomNameError("");
                }}
                maxLength={20}
              />
              {roomNameError && <Form.Text className="text-danger">{roomNameError}</Form.Text>}
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3 w-100">
              Join/Create Room
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

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
          <Button variant="outline-secondary" className="mt-3 px-4 py-2 ms-2" onClick={handleAnonymousChat}>
            Chat Anonymously
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
          <Button variant="outline-secondary" className="px-4 py-2 ms-2" onClick={handleAnonymousChat}>
            Chat Anonymously
          </Button>
        </div>
      )}
    </div>
  );
}