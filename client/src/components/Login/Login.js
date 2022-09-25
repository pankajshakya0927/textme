import React from "react";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Toastr from "../Toastr/Toastr";
import "../../App.css";

function Login() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const history = useHistory();

  const loginHandler = (event) => {
    event.preventDefault();

    const container = document.getElementById("toastr");
    const root = createRoot(container);

    if (!username || !password) {
      root.render(<Toastr variant="Danger" title="Error" message="username or password can't be empty" />);
    } else {
      const config = {
        "Content-type": "application/json",
      };

      axios
        .post("http://localhost:5000/api/user/login", { username, password }, config)
        .then((resp) => {
          history.push("/chats");
        })
        .catch((error) => {
          root.render(<Toastr variant="Danger" title={error.response.data.error} message={error.response.data.message} />);
        });
    }
  }

  return (
    <Container>
      <div id="toastr"></div>
      <Row>
        <Col className="container d-inline-flex align-items-center justify-content-center">
          <Form>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" onChange={(e) => setUsername(e.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            </Form.Group>
            <Button variant="primary" type="Submit" onClick={loginHandler}>
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
