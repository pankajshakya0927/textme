import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";

import ChatBox from "../ChatBox/ChatBox";
import Toastr from "../Toastr/Toastr";
import utils from "../../shared/Utils";
import config from "../../configurations/config";
import { AuthContext } from "../../context/AuthContext";
import { FriendsContext } from "../../context/FriendsContext";
import "./ChatTabs.css";

function ChatTabs() {
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState(1);
  const [selectedChat, setSelectedChat] = useState();
  const [chatId, setChatId] = useState();
  const { updatedFriends } = useContext(FriendsContext);
  const { isLoggedIn } = useContext(AuthContext);

  const access_token = utils.getItemFromLocalStorage("access_token");
  const current_user = JSON.parse(utils.getItemFromLocalStorage("current_user"));

  const reqConfig = {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  };

  const shouldFetch = useRef(true);
  const history = useHistory();

  const options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const handleOnHide = () => {
    setToaster(options);
  };

  if (updatedFriends && updatedFriends !== friends) {
    setFriends(updatedFriends);
  }

  useEffect(() => {
    if (isLoggedIn && shouldFetch.current) {
      shouldFetch.current = false;
      fetchChats();
      fetchFriends();
    }
  }, []);

  const handleSelectFriend = (friend, e) => {
    e.preventDefault();

    if (isLoggedIn) {
      const chatReq = {
        members: [friend, current_user.username],
      };

      axios
        .post(`${config.apiBaseUrl}/chat/createChat`, chatReq, reqConfig)
        .then(
          (resp) => {
            if (resp && resp.data && resp.data.data) {
              const chatRes = resp.data.data;
              fetchChats();

              const chatWith = chatRes.members.find((member) => member !== current_user.username);
              setSelectedChat(chatWith);
              setTab(1); // Clicking on friend should open the chat with them

              const chat = {
                chatId: chatRes._id,
                chatWith
              }
              fetchMessages(chat);
            }
          },
          (error) => {
            const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
            setToaster(errorOptions);
          }
        )
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const fetchFriends = () => {
    axios
      .get(`${config.apiBaseUrl}/user/fetchFriends`, reqConfig)
      .then((resp) => {
        if (resp && resp.data && resp.data.data) {
          setFriends(resp.data.data);
        }
      })
      .catch((error) => {
        const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
        setToaster(errorOptions);
        history.push("/login");
        utils.logout();
      });
  };

  const fetchChats = () => {
    if (isLoggedIn) {
      axios
        .get(`${config.apiBaseUrl}/chat/fetchChats`, reqConfig)
        .then((resp) => {
          if (resp && resp.data && resp.data.data) {
            const chats = [];
            resp.data.data.forEach((chat) => {
              const chatWith = chat.members.find((member) => member !== current_user.username);
              chats.push({
                chatId: chat._id,
                chatWith: chatWith,
              });
            });
            setChats(chats);
          }
        })
        .catch((error) => {
          const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
          setToaster(errorOptions);
        });
    }
  };

  const fetchMessages = (chat) => {
    const chatId = chat.chatId;
    setChatId(chatId);
    setSelectedChat(chat.chatWith);

    const messageReq = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        chatId: chatId,
      },
    };

    if (isLoggedIn && chatId) {
      axios
        .get(`${config.apiBaseUrl}/message/fetchAll`, messageReq)
        .then((resp) => {
          if (resp && resp.data && resp.data.data) {
            setMessages(resp.data.data);
          }
        })
        .catch((error) => {
          const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
          setToaster(errorOptions);
        });
    }
  };

  const handleSelectChat = (chat, e) => {
    e.preventDefault();
    fetchMessages(chat);
  };

  const handleSetTab = (tab, e) => {
    e.preventDefault();
    setTab(tab);
  };

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Tab.Container id="list-group-tabs">
        <Row className={friends && friends.length ? "tabs g-1" : "hide"}>
          <Col sm={4}>
            <ListGroup>
              <ListGroup.Item>
                <ListGroup horizontal>
                  <ListGroup.Item action onClick={(e) => handleSetTab(1, e)}>
                    Chats
                  </ListGroup.Item>
                  <ListGroup.Item action onClick={(e) => handleSetTab(2, e)}>
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
          <Col sm={8}>
            {!selectedChat ? (
              <h5 className="align-center">
                Choose a chat to start the conversation
                <span className="emoji monkey" role="img" aria-label="monkey"></span>
              </h5>
            ) : null}
            <Tab.Content>
              <Tab.Pane eventKey={selectedChat}>
                <ChatBox chatId={chatId} chatWith={selectedChat} messages={messages} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>

        <div className={friends && friends.length ? "hide" : "container"}>
          {isLoggedIn ? (
            <h5>
              Hi there!{" "}
              <span role="img" aria-label="wave" className="wave">
                👋
              </span>{" "}
              Welcome to TextMe!!! <br />
              Add your first friend to get the fun started.
            </h5>
          ) : (
            <h5>
              Hi there!{" "}
              <span role="img" aria-label="wave" className="wave">
                👋
              </span>{" "}
              Welcome to TextMe!!!
            </h5>
          )}
        </div>
      </Tab.Container>
    </>
  );
}

export default ChatTabs;
