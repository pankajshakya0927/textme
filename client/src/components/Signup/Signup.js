import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "../../App.css"

function Signup() {
  return (
    <Container>
      <Row>
        <Col className="container d-inline-flex align-items-center justify-content-center">
          <Form>
            <Form.Group className="mb-3" controlId="userId">
              <Form.Label>UserId</Form.Label>
              <Form.Control type="text" placeholder="Enter UserId" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="securityQ">
              <Form.Label>Select a security question</Form.Label>
              <Form.Select className="mb-2" aria-label="Security Question">
                <option>Open this select menu</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </Form.Select>
              <Form.Control type="text" placeholder="Answer" />
              <Form.Text id="passwordResetHelp" muted>
                This will be used to recover your password
              </Form.Text>
            </Form.Group>

            <Button variant="primary" type="Submit">
              Signup
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;
