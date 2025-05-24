import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { AuthContext } from "../../context/AuthContext";
import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import "../../App.css";

import socket from "../../utils/socket";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setIsLoggedIn } = useContext(AuthContext);

  let options = Utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const history = useHistory();

  const handleOnHide = () => setToaster(options);

  const loginHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validation
    if (!username.trim() || !password.trim()) {
      setLoading(false);
      return setToaster(Utils.getErrorToastrOptions("Error", "Username and Password cannot be empty"));
    }

    try {
      const reqConfig = { headers: { "Content-type": "application/json" } };
      const response = await axios.post(`${apiBaseUrl}/user/login`, {
        username: username.trim(),
        password: password.trim()
      }, reqConfig);

      if (response.data.data) {
        Utils.setItemToLocalStorage("access_token", response.data.data.access_token);
        Utils.setItemToLocalStorage("current_user", JSON.stringify(response.data.data.current_user));
        Utils.setItemToLocalStorage("isLoggedIn", true);
        setIsLoggedIn(true);

        // After successful login, set socket auth and connect
        socket.auth = { token: response.data.data.access_token };
        socket.connect();  // This ensures real-time features work immediately after login

        history.push("/chats");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      setToaster(Utils.getErrorToastrOptions("Error", errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Row className="justify-content-center">
        <Col md={5}>
          <Form onSubmit={loginHandler}>
            {/* Username */}
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {/* Login Button */}
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;