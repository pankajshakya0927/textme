import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import socket from "../../utils/socket";

import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import { FaUser } from 'react-icons/fa';

import ChatBox from "../ChatBox/ChatBox";
import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import { AuthContext } from "../../context/AuthContext";
import { FriendsContext } from "../../context/FriendsContext";
import IncomingCallModal from "../IncomingCallModal/IncomingCallModal";
import CallWindow from "../CallWindow/CallWindow";

import "./ChatTabs.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function ChatTabs() {
  // State to hold friends, chats, messages etc.
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState([]);
  const [tab, setTab] = useState(1);
  const [selectedChat, setSelectedChat] = useState();
  const [chatId, setChatId] = useState();

  // Call state managed globally here:
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  // const [callAnswer, setCallAnswer] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const [callPeerUser, setCallPeerUser] = useState(null);

  const { updatedFriends } = useContext(FriendsContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [width, setWidth] = useState(window.innerWidth);

  const history = useHistory();
  const shouldFetch = useRef(true);

  const options = Utils.getDefaultToastrOptions();
  const [toastr, setToastr] = useState(options);

  const access_token = Utils.getItemFromLocalStorage("access_token");
  const current_user = JSON.parse(Utils.getItemFromLocalStorage("current_user"));
  const username = current_user?.username;

  // Axios request config with token
  const reqConfig = useMemo(() => ({
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  }), [access_token]);

  // Window resize handler (for responsive UI)
  useEffect(() => {
    const handleWindowSizeChange = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowSizeChange);
    return () => window.removeEventListener("resize", handleWindowSizeChange);
  }, []);
  const isMobile = width <= 576;

  // Ensure socket is connected after a page refresh or direct URL access to /chats
  // If user directly lands on this page (bypassing Login), we set socket.auth from stored token and reconnect
  useEffect(() => {
    const token = Utils.getItemFromLocalStorage("access_token");
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    return () => {
      // Optional: Disconnect socket on unmount to avoid duplicate connections
      socket.disconnect();
    };
  }, []);

  // ⚡ Set up socket event listeners for chat messages and call signaling
  useEffect(() => {
    // 📨 Incoming messages
    const onFetchMessages = (msgs) => setMessages(msgs);
    const onNewMessageReceived = (msg) => setNewMessage(msg);

    // 📞 Incoming call offer
    const onCallMade = ({ from, offer }) => {
      setIncomingCall({ from, offer });   // Show incoming call modal
      setCallPeerUser(from);              // Store caller for use in CallWindow
    };

    // const onAnswerMade = ({ from, answer }) => {
    //   // if (from !== callPeerUser) return;
    //   // Update state so CallWindow gets this answer prop
    //   setCallAnswer(answer);
    // };

    // 📴 Call ended (hang up or rejected)
    const onCallEnded = () => {
      setShowVideoCall(false);
      setShowAudioCall(false);
      setIncomingCall(null);
      setIsCaller(false);
      setCallPeerUser(null);
    };

    // ❌ Call rejected by peer
    const onCallRejected = ({ from }) => {
      // Optional: could display a toast like "Call rejected by X"
      setShowVideoCall(false);
      setShowAudioCall(false);
      setIncomingCall(null);
      setIsCaller(false);
      setCallPeerUser(null);
    };

    // ✅ Register socket listeners
    socket.on("fetchMessages", onFetchMessages);
    socket.on("newMessageReceived", onNewMessageReceived);
    socket.on("call-made", onCallMade);
    // socket.on("answer-made", onAnswerMade);
    socket.on("call-ended", onCallEnded);
    socket.on("call-rejected", onCallRejected);

    // 🧹 Cleanup on unmount or re-render
    return () => {
      socket.off("fetchMessages", onFetchMessages);
      socket.off("newMessageReceived", onNewMessageReceived);
      socket.off("call-made", onCallMade);
      // socket.off("answer-made", onAnswerMade);
      socket.off("call-ended", onCallEnded);
      socket.off("call-rejected", onCallRejected);
    };
  }, [username]);

  // Fetch friends list from API
  const fetchFriends = useCallback(async () => {
    try {
      const resp = await axios.get(`${apiBaseUrl}/user/fetchFriends`, reqConfig);
      if (resp?.data?.data) setFriends(resp.data.data);
    } catch (error) {
      const errorOptions = Utils.getErrorToastrOptions(error.response?.data?.error, error.response?.data?.message);
      setToastr(errorOptions);
      history.push("/login");
      Utils.logout();
    }
  }, [reqConfig, history]);

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const resp = await axios.get(`${apiBaseUrl}/chat/fetchChats`, reqConfig);
      if (resp?.data?.data) {
        const chatsData = resp.data.data.map(chat => ({
          chatId: chat._id,
          chatWith: chat.members.find(member => member !== username),
        }));
        setChats(chatsData);
      }
    } catch (error) {
      const errorOptions = Utils.getErrorToastrOptions(error.response?.data?.error, error.response?.data?.message);
      setToastr(errorOptions);
    }
  }, [isLoggedIn, reqConfig, username]);

  // Initial fetch of friends and chats
  useEffect(() => {
    if (isLoggedIn && shouldFetch.current) {
      shouldFetch.current = false;
      fetchChats();
      fetchFriends();
    }
  }, [isLoggedIn, fetchChats, fetchFriends]);

  // Add new incoming message to message list if it belongs to current chat
  useEffect(() => {
    if (newMessage?.from === selectedChat) {
      setMessages(prev => [...prev, newMessage]);
    }
  }, [newMessage, selectedChat]);

  // Fetch messages for a selected chat and set current chat state
  const fetchMessages = (chat) => {
    setChatId(chat.chatId);
    setSelectedChat(chat.chatWith);
    if (isLoggedIn && chat.chatId) {
      socket.emit("fetchMessages", chat);
    }
  };

  // Create or open chat with friend and fetch messages
  const handleSelectFriend = async (friend, e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    try {
      const chatReq = { members: [friend, username] };
      const resp = await axios.post(`${apiBaseUrl}/chat/createChat`, chatReq, reqConfig);
      if (resp?.data?.data) {
        fetchChats();
        const chatRes = resp.data.data;
        const chatWith = chatRes.members.find(member => member !== username);
        setSelectedChat(chatWith);
        setTab(1);
        fetchMessages({ chatId: chatRes._id, chatWith });
      }
    } catch (error) {
      const errorOptions = Utils.getErrorToastrOptions(error.response?.data?.error, error.response?.data?.message);
      setToastr(errorOptions);
    }
  };

  // Open existing chat and fetch messages
  const handleSelectChat = (chat, e) => {
    e.preventDefault();
    fetchMessages(chat);
  };

  // Switch between chats and friends tabs
  const handleSetTab = (tabIndex, e) => {
    e.preventDefault();
    setTab(tabIndex);
  };

  // Update friends list if context changes
  useEffect(() => {
    if (updatedFriends && updatedFriends !== friends) {
      setFriends(updatedFriends);
    }
  }, [updatedFriends, friends]);

  // Accept an incoming call: close modal, open call window
  const acceptCall = () => {
    setIsCaller(false);
    setCallPeerUser(incomingCall.from); // if you have this state
    setIncomingCall(null);
    setShowVideoCall(true);
  };

  // Reject incoming call: notify caller, close modal
  const rejectCall = () => {
    if (incomingCall?.from) {
      socket.emit("call-rejected", { to: incomingCall.from });
    }
    setIncomingCall(null);
    setIsCaller(false);
    setShowVideoCall(false);
    setShowAudioCall(false);
  };

  return (
    <>
      {/* Toastr for error/success messages */}
      <Toastr show={toastr.show} onHide={() => setToastr(options)} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      <Tab.Container id="list-group-tabs">
        <Row className={friends?.length ? "tabs g-1" : "hide"}>
          {isMobile}
          <Col sm={4} style={{ display: isMobile && selectedChat ? "none" : "block" }}>
            <ListGroup>
              <ListGroup.Item>
                <ListGroup horizontal>
                  <ListGroup.Item className={tab === 1 ? "selected" : ""} action onClick={(e) => handleSetTab(1, e)}>Chats</ListGroup.Item>
                  <ListGroup.Item className={tab === 2 ? "selected" : ""} action onClick={(e) => handleSetTab(2, e)}>Friends</ListGroup.Item>
                </ListGroup>
              </ListGroup.Item>

              {/* Chats list */}
              {tab === 1 && (
                <div className="chats-tab">
                  {chats.map((chat, key) => (
                    <ListGroup.Item key={key} action href={chat.chatWith} onClick={(e) => handleSelectChat(chat, e)} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="rounded-circle" style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUser size={30} />
                      </div>
                      <span className="mg-l10 word-wrap">{chat.chatWith}</span>
                    </ListGroup.Item>
                  ))}
                </div>
              )}

              {/* Friends list */}
              {tab === 2 && (
                <div className="friends-tab">
                  {friends.map((friend, key) => (
                    <ListGroup.Item key={key} action href={friend} onClick={(e) => handleSelectFriend(friend, e)} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="rounded-circle" style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUser size={30} />
                      </div>
                      <span className="mg-l10 word-wrap">{friend}</span>
                    </ListGroup.Item>
                  ))}
                </div>
              )}
            </ListGroup>
          </Col>

          {/* Chat panel */}
          <Col sm={8} style={{ display: isMobile && !selectedChat ? "none" : "block" }}>
            {!selectedChat && <div className="text-center mt-3"><p>No chats yet. Start a conversation!</p></div>}
            <Tab.Content>
              <Tab.Pane eventKey={selectedChat}>
                <ChatBox
                  chatId={chatId}
                  chatWith={selectedChat}
                  setSelectedChat={setSelectedChat}
                  messages={messages}
                  setMessages={setMessages}
                  socket={socket}
                  onVideoCall={() => {
                    setIsCaller(true);
                    setShowVideoCall(true);
                  }}
                  onAudioCall={() => {
                    setIsCaller(true);
                    setShowAudioCall(true);
                  }}
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>

        {/* Empty state */}
        <div className={friends?.length ? "hide" : "container"}>
          {isLoggedIn ? (
            <div className="text-center mt-5">
              <h4>Welcome to TextMe! <span role="img" aria-label="wave" className="wave">👋</span></h4>
              <p>Add a friend to start chatting.</p>
            </div>
          ) : (
            <h4>Welcome to TextMe! <span role="img" aria-label="wave" className="wave">👋</span></h4>
          )}
        </div>

        {/* Incoming call modal */}
        {incomingCall && (
          <IncomingCallModal show from={incomingCall.from} onAccept={acceptCall} onReject={rejectCall} />
        )}

        {/* Video call window */}
        {showVideoCall && (
          <CallWindow
            type="video"
            onClose={() => setShowVideoCall(false)}
            socket={socket}
            peerUser={callPeerUser || selectedChat}
            isCaller={isCaller}
            // answer={callAnswer}
            offer={incomingCall?.offer}
          />
        )}

        {/* Audio call window */}
        {showAudioCall && (
          <CallWindow
            type="audio"
            onClose={() => setShowAudioCall(false)}
            socket={socket}
            peerUser={callPeerUser || selectedChat}
            isCaller={isCaller}
            // answer={callAnswer}
            offer={incomingCall?.offer}
          />
        )}

      </Tab.Container>
    </>
  );
}

export default ChatTabs;