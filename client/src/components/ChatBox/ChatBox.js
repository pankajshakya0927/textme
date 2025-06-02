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
import { IoMdArrowRoundBack } from "react-icons/io";
import ListGroup from "react-bootstrap/ListGroup";
import data from '@emoji-mart/data'
import { Picker } from 'emoji-mart'

import { AuthContext } from "../../context/AuthContext";
import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";

import "./ChatBox.css";

export default function ChatBox(props) {
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const options = Utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);

  const handleOnHide = () => setToaster(options);
  const lastMessageRef = useRef(null);
  const typingTimerRef = useRef(null);

  const currentUser = JSON.parse(Utils.getItemFromLocalStorage("current_user"));
  const username = currentUser?.username;

  const handleTyping = () => {
    if (username) {
      const typingData = {
        text: `${username} is typing...`,
        from: username,
        to: props.chatWith
      };
      props.socket.emit("typing", typingData);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (isLoggedIn && message.trim() && username) {  // Ensure message isn't empty
      const messageReq = {
        chatId: props.chatId,
        message: message.trim(),
        from: username,
        to: props.chatWith
      };

      // Optimistic UI update
      props.setMessages(prevMessages => [
        ...prevMessages,
        { message: message.trim(), from: username, to: props.chatWith }
      ]);

      // Emit the message to the server
      props.socket.emit("sendMessage", messageReq);

      setMessage("");
    }
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [props.messages]);

  useEffect(() => {
    const handleTypingStatus = (typingData) => {
      clearTimeout(typingTimerRef.current);
      setTypingStatus(typingData);

      typingTimerRef.current = setTimeout(() => {
        setTypingStatus("");
      }, 1000);
    };

    props.socket.on("typingStatus", handleTypingStatus);

    return () => {
      props.socket.off("typingStatus", handleTypingStatus);
      clearTimeout(typingTimerRef.current);
    };
  }, [props.socket]);

  // Helper to convert unified code to emoji character (for emoji-mart v6+)
  function unifiedToEmoji(unified) {
    return unified.split('-').map(u => String.fromCodePoint(parseInt(u, 16))).join('');
  }

  const handleEmojiSelect = (emoji) => {
    const emojiChar = emoji.unified ? unifiedToEmoji(emoji.unified) : '';
    setMessage((prev) => prev + emojiChar);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      <Card className="box">
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Button className="back-btn" variant="light" onClick={() => props.setSelectedChat(null)}>
              <IoMdArrowRoundBack size={30} />
            </Button>

            <div className="chat-header-names">
              <h4 className="word-wrap mb-0">{props.chatWith}</h4>
              {/* Typing Indicator (only show when active) */}
              {typingStatus?.text && props.chatWith === typingStatus.from && username === typingStatus.to && (
                <span className="typing-text">typing...</span>
              )}
            </div>
          </div>
          <div>
            <ButtonGroup aria-label="Call">
              <Button variant="light" onClick={props.onAudioCall}>
                <MdCall color="rgb(76, 175, 80)" size={25} />
              </Button>
              <Button variant="light" onClick={props.onVideoCall}>
                <FcVideoCall size={30} />
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>
        <Card.Body className="overflow-auto chat-box d-flex flex-column">
          {props.messages.map((msg, key) => (
            <ListGroup key={key} className={msg.from === username ? "align-items-end mb-2" : "align-items-start mb-2"}>
              <ListGroup.Item variant={msg.from === username ? "primary" : "light"}>
                {msg.message}
              </ListGroup.Item>
            </ListGroup>
          ))}
          <div ref={lastMessageRef}></div>
        </Card.Body>
        <Card.Footer>
          <Form>
            <InputGroup>
              <div style={{ position: 'relative' }}>
                <Button variant="outline-secondary" type="button" onClick={() => setShowEmojiPicker((v) => !v)}>
                  <BiSmile size={20} />
                </Button>
                {showEmojiPicker && (
                  <div style={{ position: 'absolute', bottom: '40px', zIndex: 1000, left: 0 }}>
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
                  </div>
                )}
              </div>
              <Button variant="outline-secondary">
                <GrAttachment size={17} />
              </Button>
              <Form.Control
                placeholder="Enter message..."
                aria-label="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleTyping}
              />
              <Button type="submit" variant="primary" id="send" onClick={handleSendMessage}>
                Send
              </Button>
            </InputGroup>
          </Form>
        </Card.Footer>
      </Card>
    </>
  );
}