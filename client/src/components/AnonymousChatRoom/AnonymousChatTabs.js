import React, { useState, useEffect, useRef } from "react";
import '../../components/ChatTabs/ChatTabs.css';
import { ListGroup, Col, Row, Tab } from "react-bootstrap";
import { FaUser } from 'react-icons/fa';
import AnonymousChatBox from './AnonymousChatBox';

export default function AnonymousChatTabs({ roomName, username, socket }) {
  const [selectedTab, setSelectedTab] = useState('group');
  const [groupMessages, setGroupMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [members, setMembers] = useState([]);
  const [width, setWidth] = useState(window.innerWidth);
  const [unreadTabs, setUnreadTabs] = useState({});
  const [userInteracted, setUserInteracted] = useState(false);
  const isMobile = width <= 576;
  const notificationAudio = useRef(null);

  // Responsive
  useEffect(() => {
    const handleWindowSizeChange = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowSizeChange);
    return () => window.removeEventListener("resize", handleWindowSizeChange);
  }, []);

  // Join room
  useEffect(() => {
    if (!username || !socket) return;
    socket.emit("anonymous-join-request", { roomName, username });
    const handleJoinDenied = (data) => {
      console.error(data.reason || "Join denied");
    };
    socket.on("anonymous-join-denied", handleJoinDenied);
    return () => {
      socket.off("anonymous-join-denied", handleJoinDenied);
    };
  }, [username, socket, roomName]);

  // Members
  useEffect(() => {
    if (!socket) return;
    const handleMembers = (data) => {
      setMembers(data.members || []);
    };
    socket.on("anonymous-members", handleMembers);
    return () => {
      socket.off("anonymous-members", handleMembers);
    };
  }, [socket]);

  // Messages
  useEffect(() => {
    if (!socket) return;
    const handleGroupMessage = (msg) => {
      setGroupMessages((prev) => [...prev, msg]);
    };
    const handlePrivateMessage = (msg) => {
      // Store message under the other user's key (works for both sender and receiver)
      const otherUser = msg.from === username ? msg.to : msg.from;
      setPrivateMessages((prev) => {
        const oldMessages = Array.isArray(prev[otherUser]) ? prev[otherUser] : [];
        return {
          ...prev,
          [otherUser]: [...oldMessages, msg],
        };
      });
    };
    socket.on('anonymous-group-message', handleGroupMessage);
    socket.on('anonymous-private-message', handlePrivateMessage);
    return () => {
      socket.off('anonymous-group-message', handleGroupMessage);
      socket.off('anonymous-private-message', handlePrivateMessage);
    };
  }, [socket, username]);

  // Group message history
  useEffect(() => {
    if (!socket) return;
    const handleGroupHistory = (history) => setGroupMessages(history);
    socket.on("anonymous-group-history", handleGroupHistory);
    return () => socket.off("anonymous-group-history", handleGroupHistory);
  }, [socket]);

  // Private message history
  useEffect(() => {
    if (!socket) return;
    const handlePrivateHistory = (history) => {
      const pm = {};
      history.forEach(msg => {
        const otherUser = msg.from === username ? msg.to : msg.from;
        if (!pm[otherUser]) pm[otherUser] = [];
        pm[otherUser].push(msg);
      });
      setPrivateMessages(pm);
    };
    socket.on("anonymous-private-history", handlePrivateHistory);
    return () => socket.off("anonymous-private-history", handlePrivateHistory);
  }, [socket, username]);

  // Ensure a chat is always selected (default to group if none)
  useEffect(() => {
    if (!selectedTab) {
      setSelectedTab('group');
    }
  }, [selectedTab]);

  // Leave room on unmount
  React.useEffect(() => {
    return () => {
      if (username && socket) {
        socket.emit('anonymous-leave-room', { roomName, username });
      }
    };
    // eslint-disable-next-line
  }, []); // Only run on mount/unmount

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

  // Play notification sound and set unread dot for group/private messages if not from self and not focused
  useEffect(() => {
    // Group message notification
    if (groupMessages.length > 0) {
      const lastMsg = groupMessages[groupMessages.length - 1];
      if (lastMsg && lastMsg.from !== username && selectedTab !== 'group') {
        // Play sound only if not focused and user has interacted
        if (userInteracted && notificationAudio.current) notificationAudio.current.play();
        // Set unread dot
        setUnreadTabs(prev => ({ ...prev, group: true }));
      }
    }
    // Private message notification
    Object.keys(privateMessages).forEach(tab => {
      const msgs = privateMessages[tab];
      if (Array.isArray(msgs) && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.from !== username && selectedTab !== tab) {
          if (userInteracted && notificationAudio.current) notificationAudio.current.play();
          setUnreadTabs(prev => ({ ...prev, [tab]: true }));
        }
      }
    });
    // eslint-disable-next-line
  }, [groupMessages, privateMessages, userInteracted]);

  // Clear unread dot when tab is selected
  useEffect(() => {
    if (selectedTab) setUnreadTabs(prev => ({ ...prev, [selectedTab]: false }));
  }, [selectedTab]);

  // Handlers
  const handleSendGroupMessage = (msg) => {
    socket.emit('anonymous-group-message', {
      room: roomName,
      from: username,
      message: msg,
    });
  };
  const handleSendPrivateMessage = (msg) => {
    socket.emit('anonymous-private-message', {
      room: roomName,
      from: username,
      to: selectedTab,
      message: msg,
    });
  };
  const handleVideoCall = () => {
    socket.emit('anonymous-call', {
      room: roomName,
      from: username,
      to: selectedTab,
      type: 'video',
    });
  };
  const handleAudioCall = () => {
    socket.emit('anonymous-call', {
      room: roomName,
      from: username,
      to: selectedTab,
      type: 'audio',
    });
  };

  // Handler for back button in ChatBox (mobile view)
  const handleBack = () => {
    // On back, show the members list (sidebar) in mobile view
    if (isMobile) {
      setSelectedTab('members');
    }
  };

  // Handler for sending a private message with optimistic UI update
  const handleOptimisticPrivateSend = (msg) => {
    setPrivateMessages((prev) => {
      const oldMessages = Array.isArray(prev[selectedTab]) ? prev[selectedTab] : [];
      return {
        ...prev,
        [selectedTab]: [...oldMessages, { message: msg, from: username, to: selectedTab }],
      };
    });
    handleSendPrivateMessage(msg);
  };

  // UI
  return (
    <Tab.Container id="anonymous-list-group-tabs" activeKey={selectedTab}>
      <audio ref={notificationAudio} src="/notification.mp3" preload="auto" style={{ display: 'none' }} />
      <Row className="tabs g-1" style={{height: '100%', minHeight: 0, flex: 1}}>
        <Col sm={4} style={{ display: isMobile && selectedTab && selectedTab !== 'members' ? "none" : "flex", flexDirection: 'column', minHeight: 0, height: '100%' }}>
          <ListGroup style={{flex: 1, minHeight: 0}}>
            <div className="chats-tab">
              <ListGroup.Item
                action
                onClick={() => setSelectedTab('group')}
                style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                className={selectedTab === 'group' ? 'selected' : ''}
                eventKey="group"
              >
                <div className="rounded-circle" style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span role="img" aria-label="group">💬</span>
                </div>
                <span className="mg-l10 word-wrap">{roomName}</span>
                {unreadTabs.group && <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: '#ff3b30', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>•</span>}
              </ListGroup.Item>
              {members.filter(m => m !== username).map((member) => (
                <ListGroup.Item
                  key={member}
                  action
                  onClick={() => setSelectedTab(member)}
                  style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                  className={selectedTab === member ? 'selected' : ''}
                  eventKey={member}
                >
                  <div className="rounded-circle" style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUser size={30} />
                  </div>
                  <span className="mg-l10 word-wrap">{member}</span>
                  {unreadTabs[member] && <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: '#ff3b30', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>•</span>}
                </ListGroup.Item>
              ))}
            </div>
          </ListGroup>
        </Col>
        <Col sm={8} className="chat-panel-col" style={{ display: isMobile && (!selectedTab || selectedTab === 'members') ? "none" : "flex", flexDirection: "column", height: '100%', minHeight: 0, padding: 0 }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tab.Content style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Tab.Pane eventKey={selectedTab} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {selectedTab === 'group' ? (
                  <AnonymousChatBox
                    isAnonymous
                    isGroup
                    chatId={roomName}
                    chatWith={roomName}
                    setSelectedChat={isMobile ? handleBack : () => {}}
                    messages={groupMessages}
                    setMessages={setGroupMessages}
                    socket={socket}
                    username={username}
                    showCallButtons={false}
                    onSendMessage={handleSendGroupMessage}
                  />
                ) : selectedTab && selectedTab !== 'members' ? (
                  <AnonymousChatBox
                    isAnonymous
                    isGroup={false}
                    chatId={roomName + ':' + [username, selectedTab].sort().join('-')}
                    chatWith={selectedTab}
                    setSelectedChat={isMobile ? handleBack : () => {}}
                    messages={Array.isArray(privateMessages[selectedTab]) ? privateMessages[selectedTab] : []}
                    setMessages={(msgs) => setPrivateMessages((prev) => ({
                      ...prev,
                      [selectedTab]: Array.isArray(msgs) ? msgs : (Array.isArray(prev[selectedTab]) ? prev[selectedTab] : [])
                    }))}
                    socket={socket}
                    username={username}
                    showCallButtons={true}
                    onSendMessage={handleOptimisticPrivateSend}
                    onVideoCall={handleVideoCall}
                    onAudioCall={handleAudioCall}
                  />
                ) : null}
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Col>
      </Row>
    </Tab.Container>
  );
}
