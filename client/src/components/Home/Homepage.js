import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { AiOutlineArrowRight } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../context/AuthContext";

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
    <Container fluid className="page-container d-flex align-items-center">
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={8} xl={7}>
            <h1 className="mb-3 fw-bold display-5">
              Stay connected with <span className="text-primary">TextMe</span>
            </h1>
            <p className="text-muted mb-4">
              Fast, simple, and secure messaging. Hop into your chats or start an anonymous room in seconds.
            </p>

            {isLoggedIn ? (
              <div className="d-flex justify-content-center flex-wrap gap-2">
                <Button variant="primary" className="px-4 py-2" onClick={handleGoToChats}>
                  Go to Chats <AiOutlineArrowRight />
                </Button>
                <Button variant="outline-secondary" className="px-4 py-2" onClick={handleAnonymousChat}>
                  Chat Anonymously
                </Button>
              </div>
            ) : (
              <div className="d-flex justify-content-center flex-wrap gap-2">
                <Button variant="primary" className="px-4 py-2" onClick={handleLogin}>
                  Login
                </Button>
                <Button variant="outline-primary" className="px-4 py-2" onClick={handleSignup}>
                  Sign Up
                </Button>
                <Button variant="outline-secondary" className="px-4 py-2" onClick={handleAnonymousChat}>
                  Chat Anonymously
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>

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
    </Container>
  );
}