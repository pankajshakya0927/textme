import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { AuthContext } from "../../context/AuthContext";
import config from "../../configurations/config";
import Toastr from "../Toastr/Toastr";
import utils from "../../shared/Utils";
import "../../App.css";

function Login() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const { setIsLoggedIn } = useContext(AuthContext);

  let options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);

  const handleOnHide = () => {
    setToaster(options);
  };

  const history = useHistory();

  const loginHandler = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      const errorOptions = utils.getErrorToastrOptions("Error", "Username or Password can't be empty");
      setToaster(errorOptions);
    } else {
      const reqConfig = {
        headers: {
          "Content-type": "application/json"
        },
      };

      await axios
        .post(`${config.apiBaseUrl}/user/login`, { username, password }, reqConfig)
        .then((resp) => {
          if (resp.data.data) {
            utils.setItemToLocalStorage("access_token", resp.data.data.access_token);
            utils.setItemToLocalStorage("current_user", JSON.stringify(resp.data.data.current_user));
            utils.setItemToLocalStorage("isLoggedIn", true);
            setIsLoggedIn(true);
            history.push("/chats");
          }
        })
        .catch((error) => {
          const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
          setToaster(errorOptions);
        });
    }
  };

  return (
    <Container>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Row>
        <Col className="container d-inline-flex align-items-center justify-content-center">
          <Form style={{ width: "20em" }}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
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
