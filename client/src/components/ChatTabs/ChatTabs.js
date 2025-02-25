import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";

import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";

import ChatBox from "../ChatBox/ChatBox";
import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import config from "../../configurations/config";
import { AuthContext } from "../../context/AuthContext";
import { FriendsContext } from "../../context/FriendsContext";
import "./ChatTabs.css";

// Establish socket connection within a useEffect to control its lifecycle
const socket = io(process.env.REACT_APP_SOCKET_URL, { transports: ["websocket"] });

function ChatTabs() {
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState([]);
  const [tab, setTab] = useState(1);
  const [selectedChat, setSelectedChat] = useState();
  const [chatId, setChatId] = useState();
  const { updatedFriends } = useContext(FriendsContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [width, setWidth] = useState(window.innerWidth);

  const history = useHistory();
  const shouldFetch = useRef(true);

  const options = Utils.getDefaultToastrOptions();
  const [toastr, setToastr] = useState(options);

  const handleOnHide = () => {
    setToastr(options);
  };

  // Fetch token and username once at the beginning
  const access_token = Utils.getItemFromLocalStorage("access_token");
  const current_user = JSON.parse(Utils.getItemFromLocalStorage("current_user"));
  const username = current_user.username;

  // Memoize the reqConfig to avoid unnecessary re-renders
  const reqConfig = useMemo(() => ({
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  }), [access_token]);

  // Handle window size changes
  useEffect(() => {
    const handleWindowSizeChange = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowSizeChange);

    return () => window.removeEventListener("resize", handleWindowSizeChange);
  }, []);

  const isMobile = width <= 576;

  // Set socket authentication and event listeners
  useEffect(() => {
    socket.auth = { username };
    socket.connect();

    socket.on("fetchMessages", (messages) => {
      setMessages(messages);
    });

    socket.on("newMessageReceived", (newMessage) => {
      setNewMessage(newMessage);
    });

    return () => {
      socket.disconnect(); // Clean up socket connection on component unmount
    };
  }, [username]);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    try {
      const resp = await axios.get(`${config.apiBaseUrl}/user/fetchFriends`, reqConfig);
      if (resp && resp.data && resp.data.data) {
        setFriends(resp.data.data);
      }
    } catch (error) {
      const errorOptions = Utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
      setToastr(errorOptions);
      history.push("/login");
      Utils.logout();
    }
  }, [reqConfig, history]);

  // Fetch chat list
  const fetchChats = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const resp = await axios.get(`${config.apiBaseUrl}/chat/fetchChats`, reqConfig);
        if (resp && resp.data && resp.data.data) {
          const chats = resp.data.data.map((chat) => ({
            chatId: chat._id,
            chatWith: chat.members.find((member) => member !== username),
          }));
          setChats(chats);
        }
      } catch (error) {
        const errorOptions = Utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
        setToastr(errorOptions);
      }
    }
  }, [isLoggedIn, reqConfig, username]);

  // Fetch chats and friends when the component mounts and user is logged in
  useEffect(() => {
    if (isLoggedIn && shouldFetch.current) {
      shouldFetch.current = false;
      fetchChats();
      fetchFriends();
    }
  }, [isLoggedIn, fetchChats, fetchFriends]);

  // Handle new messages being received
  useEffect(() => {
    if (newMessage && newMessage.from === selectedChat) {
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [newMessage, selectedChat]);

  // Fetch messages for a specific chat
  const fetchMessages = (chat) => {
    const chatId = chat.chatId;
    setChatId(chatId);
    setSelectedChat(chat.chatWith);

    if (isLoggedIn && chatId) {
      socket.emit("fetchMessages", chat);
    }
  };

  // Select a friend to chat with or create a new chat
  const handleSelectFriend = async (friend, e) => {
    e.preventDefault();

    if (isLoggedIn) {
      const chatReq = { members: [friend, username] };

      try {
        const resp = await axios.post(`${config.apiBaseUrl}/chat/createChat`, chatReq, reqConfig);
        if (resp && resp.data && resp.data.data) {
          const chatRes = resp.data.data;
          fetchChats();

          const chatWith = chatRes.members.find((member) => member !== username);
          setSelectedChat(chatWith);
          setTab(1); // Clicking on friend should open the chat with them

          const chat = { chatId: chatRes._id, chatWith };
          fetchMessages(chat);
        }
      } catch (error) {
        const errorOptions = Utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
        setToastr(errorOptions);
      }
    }
  };

  // Select a chat to open
  const handleSelectChat = (chat, e) => {
    e.preventDefault();
    fetchMessages(chat);
  };

  // Set the active tab
  const handleSetTab = (tab, e) => {
    e.preventDefault();
    setTab(tab);
  };

  // Update friends list if context value changes
  useEffect(() => {
    if (updatedFriends && updatedFriends !== friends) {
      setFriends(updatedFriends);
    }
  }, [updatedFriends, friends]);

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Tab.Container id="list-group-tabs">
        <Row className={friends && friends.length ? "tabs g-1" : "hide"}>
          {isMobile}
          <Col sm={4} style={{ display: isMobile && selectedChat ? "none" : "block" }}>
            <ListGroup>
              <ListGroup.Item>
                <ListGroup horizontal>
                  <ListGroup.Item className={tab === 1 ? "selected" : ""} action onClick={(e) => handleSetTab(1, e)}>
                    Chats
                  </ListGroup.Item>
                  <ListGroup.Item className={tab === 2 ? "selected" : ""} action onClick={(e) => handleSetTab(2, e)}>
                    Friends
                  </ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>
              {tab === 1 && (
                <div className="chats-tab">
                  {chats.map((chat, key) => (
                    <ListGroup.Item key={key} action href={chat.chatWith} onClick={(e) => handleSelectChat(chat, e)}>
                      <img className="rounded-circle" alt="profile" src={require("../../assets/images/profile.png")} width="50px" data-holder-rendered="true" />
                      <span className="mg-l10 word-wrap">{chat.chatWith}</span>
                    </ListGroup.Item>
                  ))}
                </div>
              )}
              {tab === 2 && (
                <div className="friends-tab">
                  {friends.map((friend, key) => (
                    <ListGroup.Item key={key} action href={friend} onClick={(e) => handleSelectFriend(friend, e)}>
                      <img className="rounded-circle" alt="profile" src={require("../../assets/images/profile.png")} width="50px" data-holder-rendered="true" />
                      <span className="mg-l10 word-wrap">{friend}</span>
                    </ListGroup.Item>
                  ))}
                </div>
              )}
            </ListGroup>
          </Col>
          <Col sm={8} style={{ display: isMobile && !selectedChat ? "none" : "block" }}>
            {!selectedChat ? (
              <div className="text-center mt-3">
                <p>No chats yet. Start a conversation!</p>
              </div>
            ) : null}
            <Tab.Content>
              <Tab.Pane eventKey={selectedChat}>
                <ChatBox chatId={chatId} chatWith={selectedChat} setSelectedChat={setSelectedChat} messages={messages} setMessages={setMessages} socket={socket} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>

        <div className={friends && friends.length ? "hide" : "container"}>
          {isLoggedIn ? (
            <div className="text-center mt-5">
              <h4>Welcome to TextMe!
                <span role="img" aria-label="wave" className="wave">
                  👋
                </span>
              </h4>
              <p>Add a friend to start chatting.</p>
            </div>
          ) : (
            <h4>Welcome to TextMe!
              <span role="img" aria-label="wave" className="wave">
                👋
              </span>
            </h4>
          )}
        </div>
      </Tab.Container>
    </>
  );
}

export default ChatTabs;