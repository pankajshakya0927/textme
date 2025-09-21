import React, { useState } from "react";
import axios from "axios";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import { BsEye, BsEyeSlash } from "react-icons/bs";

import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import "../../App.css";
import AppCard from "../Common/AppCard";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function Signup() {
  const securityQs = [
    { value: 1, label: "What was your childhood nickname?" },
    { value: 2, label: "In what city did you meet your spouse/significant other?" },
    { value: 3, label: "What is the name of your favorite childhood friend?" },
    { value: 4, label: "What was the last name of your favorite childhood teacher?" },
    { value: 5, label: "What is the name of your youngest child?" },
    { value: 6, label: "What is your sibling’s birthday month and year?" },
    { value: 7, label: "What school did you attend for sixth grade?" },
    { value: 8, label: "What was the name of your first stuffed animal?" },
    { value: 9, label: "In what city or town did your mother and father meet?" },
    { value: 10, label: "What was your childhood phone number including area code?" },
  ];

  const [passwordType, setPasswordType] = useState("password");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [securityQ, setSecurityQ] = useState("");
  const [securityA, setSecurityA] = useState("");

  let options = Utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);

  const handleOnHide = () => setToaster(options);

  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const signupHandler = async (event) => {
    event.preventDefault();

    // Validation Checks
    if (!username.trim() || !password.trim()) {
      return setToaster(Utils.getErrorToastrOptions("Error", "Username and Password cannot be empty"));
    }
    // if (password.length < 6) {
    //   return setToaster(Utils.getErrorToastrOptions("Error", "Password must be at least 6 characters long"));
    // }
    // if (!securityQ) {
    //   return setToaster(Utils.getErrorToastrOptions("Error", "Please select a security question"));
    // }
    // if (!securityA.trim()) {
    //   return setToaster(Utils.getErrorToastrOptions("Error", "Security answer cannot be empty"));
    // }

    try {
      const reqConfig = { "Content-type": "application/json" };
      const response = await axios.post(`${apiBaseUrl}/user/signup`, {
        username: username.trim(),
        password,
        securityQ,
        securityA: securityA.trim()
      }, reqConfig);

      setToaster(Utils.getSuccessToastrOptions(response.data.message));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
      setToaster(Utils.getErrorToastrOptions("Error", errorMessage));
    }
  };

  return (
    <Container className="page-container d-flex align-items-center">
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Row className="justify-content-center w-100 mx-0">
        <Col xs={11} sm={9} md={7} lg={5} xl={4}>
          <AppCard title="Create your account">
            <Form onSubmit={signupHandler}>
              {/* Username */}
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} />
                <Form.Text muted>Username should be unique.</Form.Text>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control type={passwordType} placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Button variant="outline-secondary" onClick={togglePasswordType}>
                    {passwordType === "password" ? <BsEyeSlash /> : <BsEye />}
                  </Button>
                </InputGroup>
                <Form.Text muted>Password must be at least 6 characters long.</Form.Text>
              </Form.Group>

              {/* Security Question */}
              <Form.Group className="mb-3" controlId="securityQ">
                <Form.Label>Select a Security Question</Form.Label>
                <Form.Select onChange={(e) => setSecurityQ(e.target.value)} defaultValue="">
                  <option value="" disabled>Select a question...</option>
                  {securityQs.map((ques, key) => (
                    <option key={key} value={ques.value}>{ques.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Security Answer */}
              <Form.Group className="mb-4" controlId="securityA">
                <Form.Control type="text" placeholder="Enter your answer" onChange={(e) => setSecurityA(e.target.value)} />
              </Form.Group>

              {/* Submit Button */}
              <Button variant="primary" type="submit" className="w-100">
                Sign Up
              </Button>
            </Form>
          </AppCard>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;