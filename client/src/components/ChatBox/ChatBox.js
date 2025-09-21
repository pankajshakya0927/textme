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
import Picker from '@emoji-mart/react'

import { AuthContext } from "../../context/AuthContext";
import Utils from "../../shared/Utils";

import "./ChatBox.css";

export default function ChatBox(props) {
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const options = Utils.getDefaultToastrOptions();
  // Simplified: no local Toastr here
  const lastMessageRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const didInitialScrollRef = useRef(false);
  const sentByMeRef = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [lastReadIndex, setLastReadIndex] = useState(0);

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
      sentByMeRef.current = true;
      props.setMessages(prevMessages => [
        ...prevMessages,
        { message: message.trim(), from: username, to: props.chatWith, createdAt: new Date().toISOString() }
      ]);

      // Emit the message to the server
      props.socket.emit("sendMessage", messageReq);

      setMessage("");
    }
  };

  // Simplified: no standalone scroll helper, handled inline where needed

  // Smart auto-scroll: only when user is near bottom, after sending, or on initial load
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const distanceFromBottom = c.scrollHeight - c.scrollTop - c.clientHeight;
    const isNearBottom = distanceFromBottom < 100; // px threshold

    const shouldScroll = sentByMeRef.current || isNearBottom || !didInitialScrollRef.current;
    if (shouldScroll) {
      const doScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      };
      // try now, next frame, and after microtask to handle layout timing
      doScroll();
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(doScroll);
      setTimeout(doScroll, 0);
    }

    // reset flags
    sentByMeRef.current = false;
    didInitialScrollRef.current = true;
    // If we scrolled (or stayed) near bottom, consider all read
    if (shouldScroll) setLastReadIndex(props.messages.length);
  }, [props.messages.length]);

  // Reset initial scroll flag when switching chats
  useEffect(() => {
    didInitialScrollRef.current = false;
    setLastReadIndex(props.messages.length);
  }, [props.chatId, props.chatWith]);

  // Track scroll position and mark as read when reaching bottom
  const handleScroll = () => {
    const c = containerRef.current;
    if (!c) return;
    const distanceFromBottom = c.scrollHeight - c.scrollTop - c.clientHeight;
    const isNowAtBottom = distanceFromBottom < 4;
    setAtBottom(isNowAtBottom);
    if (isNowAtBottom) {
      setLastReadIndex(props.messages.length);
    }
  };

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
  
  // Helpers for date/time formatting
  const dateKey = (d) => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  const formatDateChip = (d) => {
    const today = new Date();
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.round((todayDate - msgDate) / (1000*60*60*24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };
  const formatTimeOnly = (d) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);

  return (
    <>
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
        <Card.Body ref={containerRef} onScroll={handleScroll} className="overflow-auto chat-box d-flex flex-column">
          {(() => {
            const items = [];
            let lastDate = null;
            for (let i = 0; i < props.messages.length; i++) {
              const msg = props.messages[i];
              const created = new Date(msg.createdAt || Date.now());
              const thisKey = dateKey(created);
              if (lastDate !== thisKey) {
                items.push(
                  <div key={`date-${thisKey}-${i}`} className="date-divider" role="separator" aria-label={formatDateChip(created)}>
                    <span className="chip">{formatDateChip(created)}</span>
                  </div>
                );
                lastDate = thisKey;
              }
              if (!atBottom && lastReadIndex === i) {
                items.push(
                  <div key={`unread-${i}`} className="new-messages-divider" role="separator" aria-label="New messages">
                    <span className="line" />
                    <span>New messages</span>
                    <span className="line" />
                  </div>
                );
              }
              items.push(
                <ListGroup key={i} className={msg.from === username ? "align-items-end mb-2" : "align-items-start mb-2"}>
                  <ListGroup.Item variant={msg.from === username ? "primary" : "light"}>
                    <div>{msg.message}</div>
                    <div className={msg.from === username ? "msg-meta text-end" : "msg-meta text-start"}>
                      <small className="text-muted">{formatTimeOnly(created)}</small>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              );
            }
            return items;
          })()}
          <div ref={lastMessageRef}></div>
        </Card.Body>
        <Card.Footer>
          <Form>
            <InputGroup>
              <div className="position-relative">
                <ButtonGroup className="me-2">
                  <Button variant="outline-secondary" type="button" onClick={() => setShowEmojiPicker((v) => !v)}>
                    <BiSmile size={20} />
                  </Button>
                  <Button variant="outline-secondary" type="button">
                    <GrAttachment size={17} />
                  </Button>
                </ButtonGroup>
                {showEmojiPicker && (
                  <div style={{ position: 'absolute', bottom: '44px', zIndex: 1000, left: 0 }}>
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
                  </div>
                )}
              </div>
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