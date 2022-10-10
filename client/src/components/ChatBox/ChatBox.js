import React, { useState, useContext } from "react";
import axios from "axios";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { MdCall } from "react-icons/md";
import { FcVideoCall } from "react-icons/fc";
import { BiSmile } from "react-icons/bi";
import { GrAttachment } from "react-icons/gr";
import ListGroup from "react-bootstrap/ListGroup";

import { AuthContext } from "../../context/AuthContext";
import Toastr from "../Toastr/Toastr";
import utils from "../../shared/Utils";
import config from "../../configurations/config";

import "./ChatBox.css";

export default function ChatBox(props) {
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState();

  const options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const handleOnHide = () => {
    setToaster(options);
  };

  const access_token = utils.getItemFromLocalStorage("access_token");
  const current_user = JSON.parse(utils.getItemFromLocalStorage("current_user"));
  const reqConfig = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };

  const handleSendMessage = () => {
    if (isLoggedIn && message) {
      const messageReq = {
        chatId: props.chatId,
        message: message,
      };

      axios
        .post(`${config.apiBaseUrl}/message/send`, messageReq, reqConfig)
        .then((resp) => {
          console.log("message sent successfully");
        })
        .catch((error) => {
          const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
          setToaster(errorOptions);
        });
    }
  };

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      <Card className="box">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div>
            <h4>{props.chatWith}</h4>
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
          {props.messages.map((msg, key) => (
            <ListGroup key={key} className={msg.sender === current_user.username ? "ms-5 mb-2" : "me-5 mb-2"} >
              <ListGroup.Item variant={msg.sender === current_user.username ? "primary" : ""} key={key}>
                {msg.message}
              </ListGroup.Item>
            </ListGroup>
          ))}
        </Card.Body>
        <Card.Footer>
          <InputGroup>
            <Button variant="outline-secondary">
              <BiSmile size={20} />
            </Button>
            <Button variant="outline-secondary">
              <GrAttachment size={17} />
            </Button>
            <Form.Control placeholder="Enter message..." aria-label="Enter message" onChange={(e) => setMessage(e.target.value)} />
            <Button variant="primary" id="send" onClick={handleSendMessage}>
              Send
            </Button>
          </InputGroup>
        </Card.Footer>
      </Card>
    </>
  );
}
