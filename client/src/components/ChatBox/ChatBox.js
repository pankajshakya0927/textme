import React, { useState, useContext, useEffect, useRef } from "react";

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

import "./ChatBox.css";

export default function ChatBox(props) {
  const { isLoggedIn } = useContext(AuthContext);
  const { username } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState("");

  const options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const handleOnHide = () => {
    setToaster(options);
  };
  const lastMessageRef = useRef(null);
  let typingTimer;

  const handleTyping = () => {
    let typingData = {
      text: `${username} is typing...`,
      from: username,
      to: props.chatWith
    }
    props.socket.emit('typing', typingData);
  }

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (isLoggedIn && message) {
      const messageReq = {
        chatId: props.chatId,
        message: message,
        from: username,
        to: props.chatWith
      };

      props.socket.emit("sendMessage", messageReq);
      setMessage("");
    }
  };

  useEffect(() => {
    // scroll to bottom every time messages change
    lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  }, [props.messages]);

  useEffect(() => {
    props.socket.on('typingStatus', (typingData) => {
      clearTimeout(typingTimer);
      setTypingStatus(typingData);
      typingTimer = setTimeout(() => {
        setTypingStatus("");
      }, 1000);
    });
    lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  }, [typingStatus]);

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      <Card className="box">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="word-wrap">{props.chatWith}</h4>
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
        <Card.Body className="overflow-auto chat-box">
          {props.messages.map((msg, key) => (
            <ListGroup key={key} className={msg.from === username ? "align-items-end mb-2" : "align-items-start mb-2"}>
              <ListGroup.Item variant={msg.from === username ? "primary" : ""} key={key}>
                {msg.message}
              </ListGroup.Item>
            </ListGroup>
          ))}
          {
            props.chatWith === typingStatus.from && username === typingStatus.to ? <span className="typing">{typingStatus.text}</span> : <span></span>
          }
          <div ref={lastMessageRef}></div>
        </Card.Body>
        <Card.Footer>
          <Form>
            <InputGroup>
              <Button variant="outline-secondary">
                <BiSmile size={20} />
              </Button>
              <Button variant="outline-secondary">
                <GrAttachment size={17} />
              </Button>
              <Form.Control placeholder="Enter message..." aria-label="Enter message" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleTyping} />
              <Button type="Submit" variant="primary" id="send" onClick={(e) => handleSendMessage(e)}>
                Send
              </Button>
            </InputGroup>
          </Form>
        </Card.Footer>
      </Card>
    </>
  );
}
