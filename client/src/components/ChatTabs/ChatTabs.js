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
  const [unreadChats, setUnreadChats] = useState({});

  // Call state managed globally here:
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const [callPeerUser, setCallPeerUser] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);

  const { updatedFriends } = useContext(FriendsContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [width, setWidth] = useState(window.innerWidth);

  const history = useHistory();
  const shouldFetch = useRef(true);
  const notificationAudio = useRef(null);
  const [userInteracted, setUserInteracted] = useState(false);

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

  // Ref to always have latest selectedChat in socket handlers
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Track first user interaction to enable audio playback
  useEffect(() => {
    const enableAudio = () => setUserInteracted(true);
    window.addEventListener('pointerdown', enableAudio, { once: true });
    window.addEventListener('keydown', enableAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // ⚡ Set up socket event listeners for chat messages and call signaling
  useEffect(() => {
    // Handler definitions must be inside useEffect for registration/unregistration
    const onFetchMessages = (msgs) => setMessages(msgs);
    const onNewMessageReceived = (msg) => {
      setNewMessage(msg);
      if (msg.from !== selectedChatRef.current) {
        setUnreadChats(prev => ({ ...prev, [msg.from]: true }));
        // Play notification sound only if not focused and user has interacted
        if (userInteracted && notificationAudio.current) notificationAudio.current.play();
      }
    };
    const onCallMade = ({ from, offer, callType }) => {
      setIncomingCall({ from, offer, callType });
      setCallPeerUser(from);
    };
    const onCallEnded = () => {
      // Restore UI cleanup: close call modal and call window, reset call state
      setShowVideoCall(false);
      setShowAudioCall(false);
      setIncomingCall(null);
      setIsCaller(false);
      setCallPeerUser(null);
      setIncomingOffer(null);
    };
    const onCallRejected = ({ from }) => {
      setShowVideoCall(false);
      setShowAudioCall(false);
      setIncomingCall(null);
      setIsCaller(false);
      setCallPeerUser(null);
    };
    function registerSocketHandlers() {
      socket.on("fetchMessages", onFetchMessages);
      socket.on("newMessageReceived", onNewMessageReceived);
      socket.on("call-made", onCallMade);
      socket.on("call-ended", onCallEnded);
      socket.on("call-rejected", onCallRejected);
    }
    function unregisterSocketHandlers() {
      socket.off("fetchMessages", onFetchMessages);
      socket.off("newMessageReceived", onNewMessageReceived);
      socket.off("call-made", onCallMade);
      socket.off("call-ended", onCallEnded);
      socket.off("call-rejected", onCallRejected);
    }
    registerSocketHandlers();
    socket.on("connect", registerSocketHandlers);
    socket.on("disconnect", unregisterSocketHandlers);
    return () => {
      unregisterSocketHandlers();
      socket.off("connect", registerSocketHandlers);
      socket.off("disconnect", unregisterSocketHandlers);
    };
  }, [userInteracted]);
  // }, [username, selectedChat]);

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
    // Clear unread indicator for this chat
    setUnreadChats(prev => ({ ...prev, [chat.chatWith]: false }));
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
    setIncomingOffer(incomingCall.offer);
    setIncomingCall(null);
    if (incomingCall.callType === 'audio') {
      setShowAudioCall(true);
    } else {
      setShowVideoCall(true);
    }
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

  // Outgoing call: set peer user before opening call window
  const handleStartVideoCall = (chatWith) => {
    setIsCaller(true);
    setCallPeerUser(chatWith);
    setShowVideoCall(true);
    setShowAudioCall(false);
    setIncomingCall(null);
    setIncomingOffer(null);
  };
  const handleStartAudioCall = (chatWith) => {
    setIsCaller(true);
    setCallPeerUser(chatWith);
    setShowAudioCall(true);
    setShowVideoCall(false);
    setIncomingCall(null);
    setIncomingOffer(null);
  };

  // Clear unread dot when a chat is selected
  useEffect(() => {
    if (selectedChat) setUnreadChats(prev => ({ ...prev, [selectedChat]: false }));
  }, [selectedChat]);

  return (
    <>
      {/* Toastr for error/success messages */}
      <audio ref={notificationAudio} src={process.env.PUBLIC_URL + '/notification.mp3'} preload="auto" style={{ display: 'none' }} />
      <Toastr show={toastr.show} onHide={() => setToastr(options)} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      <Tab.Container id="list-group-tabs">
        <Row className={friends?.length ? "tabs g-1" : "hide"} style={{height: '100%', minHeight: 0, flex: 1}}>
          {isMobile}
          <Col sm={4} style={{ display: isMobile && selectedChat ? "none" : "flex", flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <ListGroup style={{flex: 1, minHeight: 0}}>
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
                    <ListGroup.Item key={key} action href={chat.chatWith} onClick={(e) => handleSelectChat(chat, e)} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <div className="rounded-circle" style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUser size={30} />
                      </div>
                      <span className="mg-l10 word-wrap">{chat.chatWith}</span>
                      {unreadChats[chat.chatWith] && (
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: '#ff3b30', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>•</span>
                      )}
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
          <Col sm={8} className="chat-panel-col" style={{ display: isMobile && !selectedChat ? "none" : "flex", flexDirection: "column", height: '100%', minHeight: 0, padding: 0 }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {!selectedChat && <div className="text-center mt-3"><p>No chats yet. Start a conversation!</p></div>}
              <Tab.Content style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Tab.Pane eventKey={selectedChat} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <ChatBox
                    chatId={chatId}
                    chatWith={selectedChat}
                    setSelectedChat={setSelectedChat}
                    messages={messages}
                    setMessages={setMessages}
                    socket={socket}
                    onVideoCall={() => handleStartVideoCall(selectedChat)}
                    onAudioCall={() => handleStartAudioCall(selectedChat)}
                  />
                </Tab.Pane>
              </Tab.Content>
            </div>
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
            offer={incomingOffer}
            chatId={chatId}
            username={username}
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
            offer={incomingOffer}
            chatId={chatId}
            username={username}
          />
        )}

      </Tab.Container>
    </>
  );
}

export default ChatTabs;