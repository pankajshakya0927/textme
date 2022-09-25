import React from "react";
import { useState } from "react";
import { createRoot } from "react-dom/client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import { BsEye, BsEyeSlash } from "react-icons/bs";

import Toastr from "../Toastr/Toastr";
import axios from "axios";

import "../../App.css";

function Signup() {
  const securityQs = [
    {
      value: 1,
      label: "What was your childhood nickname?",
    },
    {
      value: 2,
      label: "In what city did you meet your spouse/significant other?",
    },
    {
      value: 3,
      label: "What is the name of your favorite childhood friend?",
    },
    {
      value: 4,
      label: "What was the last name of your favorite childhood teacher?",
    },
    {
      value: 5,
      label: "What is the name of your youngest child?",
    },
    {
      value: 6,
      label: "What is your sibling’s birthday month and year?",
    },
    {
      value: 7,
      label: "What school did you attend for sixth grade?",
    },
    {
      value: 8,
      label: "What was the name of your first stuffed animal?",
    },
    {
      value: 9,
      label: "In what city or town did your mother and father meet?",
    },
    {
      value: 10,
      label: "What was your childhood phone number including area code?",
    },
    {
      value: 11,
      label: "Where were you when you had your first kiss?",
    },
    {
      value: 12,
      label: "What is the name of the place your wedding reception was held?",
    },
    {
      value: 13,
      label: "What time of the day were you born?",
    },
    {
      value: 14,
      label: "What are the last 4 digits of your credit/debit card?",
    },
    {
      value: 15,
      label: "What is your grandmother's first name?",
    },
    {
      value: 16,
      label: "What year did you graduate from High School?",
    },
  ];

  const [passwordType, setPasswordType] = useState("password");
  const [passwordInput, setPasswordInput] = useState("");
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [securityQ, setSecurityQ] = useState();
  const [securityA, setSecurityA] = useState();

  const handlePasswordChange = (event) => {
    setPasswordInput(event.target.value);
    setPassword(event.target.value);
  };

  const togglePasswordType = () => {
    if (passwordType === "password") {
      setPasswordType("text");
    } else setPasswordType("password");
  };

  const signupHandler = (event) => {
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
        .post("http://localhost:5000/api/user/signup", { username, password, securityQ, securityA }, config)
        .then((resp) => {
          root.render(<Toastr variant="Success" title="Success" message={resp.data.message} />);
        })
        .catch((error) => {
          root.render(<Toastr variant="Danger" title={error.response.data.error} message={error.response.data.message} />);
        });
    }
  };

  return (
    <Container>
      <div id="toastr"></div>
      <Row>
        <Col className="container d-inline-flex align-items-center justify-content-center">
          <Form>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} />
              <Form.Text id="usernameHelp" muted>
                Username should be unique
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control type={passwordType} onChange={handlePasswordChange} value={passwordInput} placeholder="Password" />
                <Button variant="outline-secondary" id="search" onClick={togglePasswordType}>
                  {passwordType === "password" ? <BsEyeSlash /> : <BsEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-1" controlId="securityQ">
              <Form.Label style={{ paddingRight: "2px" }}>Select a security question</Form.Label>
              <Form.Text id="passwordResetHelp" muted>
                (This will be used for password recovery)
              </Form.Text>
              <Form.Select className="mb-2" aria-label="Security Question" onChange={(e) => setSecurityQ(e.target.value)}>
                <option>Open this select menu</option>
                {securityQs.map((ques, key) => {
                  return (
                    <option key={key} value={ques.value}>
                      {ques.label}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="securityA">
              <Form.Control type="text" placeholder="Answer" onChange={(e) => setSecurityA(e.target.value)} />
            </Form.Group>

            <Button variant="primary" type="Submit" onClick={signupHandler}>
              Signup
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;
