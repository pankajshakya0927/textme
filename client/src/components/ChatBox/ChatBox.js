import React from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { MdCall } from "react-icons/md";
import { FcVideoCall } from "react-icons/fc";
import { BiSmile } from "react-icons/bi";
import { GrAttachment } from "react-icons/gr";

import "./ChatBox.css";

export default function ChatBox(props) {
  return (
    <Card className="box">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div>
          <h4>{props.message}</h4>
          <span>Typing...</span>
        </div>
        <div>
          <ButtonGroup aria-label="Call">
            <Button variant="light">
              <MdCall color="rgb(76, 175, 80)" size={25} />
            </Button>
            <Button variant="light">
              <FcVideoCall size={30} />
            </Button>
          </ButtonGroup>
        </div>
      </Card.Header>
      <Card.Body>
        <Card.Text>{props.message}</Card.Text>
      </Card.Body>
      <Card.Footer>
        <InputGroup>
          <Button variant="outline-secondary">
              <BiSmile size={20} />
          </Button>
          <Button variant="outline-secondary">
              <GrAttachment size={17} />
          </Button>
          <Form.Control placeholder="Enter message..." aria-label="Enter message" />
          <Button variant="primary" id="send">
            Send
          </Button>
        </InputGroup>
      </Card.Footer>
    </Card>
  );
}
