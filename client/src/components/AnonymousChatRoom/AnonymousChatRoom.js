import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AnonymousChatTabs from "./AnonymousChatTabs";
import socket from "../../utils/socket";

function getStoredAnonymousUsername(roomName) {
  const value = sessionStorage.getItem(`anonymous_username_${roomName}`);
  // Defensive: treat null, undefined, or empty string as no username
  if (!value) return "";
  return value;
}
function setStoredAnonymousUsername(roomName, username) {
  if (username) {
    sessionStorage.setItem(`anonymous_username_${roomName}`, username);
  } else {
    sessionStorage.removeItem(`anonymous_username_${roomName}`);
  }
}
function getStoredAnonymousToken(roomName) {
  let token = sessionStorage.getItem(`anonymous_token_${roomName}`);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(`anonymous_token_${roomName}`, token);
  }
  return token;
}
function setStoredAnonymousToken(roomName, token) {
  if (token) {
    sessionStorage.setItem(`anonymous_token_${roomName}`, token);
  } else {
    sessionStorage.removeItem(`anonymous_token_${roomName}`);
  }
}

export default function AnonymousChatRoom(props) {
  // Get roomName from route params
  const { roomName } = useParams();
  const [username, setUsername] = useState(getStoredAnonymousUsername(roomName));
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // Ensure socket is connected for anonymous chat
  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, []);

  // Handler for username form submit
  function handleUsernameSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Username is required");
      return;
    }
    if (/\s/.test(trimmed)) {
      setError("No spaces allowed in username");
      return;
    }
    setUsername(trimmed);
    setStoredAnonymousUsername(roomName, trimmed);
    // Generate and store a new token for this username/room
    const token = crypto.randomUUID();
    setStoredAnonymousToken(roomName, token);
    setError("");
  }

  // Join room effect
  useEffect(() => {
    if (!username || !socket) return;
    const token = getStoredAnonymousToken(roomName);
    socket.emit("anonymous-join-request", { roomName, username, token });
    // eslint-disable-next-line
  }, [username, socket, roomName]);

  // Listen for join denied from server
  React.useEffect(() => {
    if (!socket) return;
    const handleJoinDenied = (data) => {
      setError(data.reason || "Join denied");
      setUsername("");
      setStoredAnonymousUsername(roomName, "");
      setStoredAnonymousToken(roomName, "");
    };
    socket.on("anonymous-join-denied", handleJoinDenied);
    return () => {
      socket.off("anonymous-join-denied", handleJoinDenied);
    };
  }, [roomName]);

  // Always keep input in sync with username for UX
  useEffect(() => {
    if (username) setInput(username);
  }, [username]);

  // Prompt for username if not set (always allow username entry, even if socket is not ready)
  if (!username) {
    return (
      <>
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
          <h4>Enter a username to join <span className="text-primary">{roomName}</span></h4>
          <form
            onSubmit={handleUsernameSubmit}
            className="w-100" style={{ maxWidth: 320 }}
          >
            <input
              className="form-control mb-2"
              placeholder="Enter username"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                setError("");
              }}
              maxLength={20}
              autoFocus
            />
            {error && <div className="text-danger mb-2">{error}</div>}
            <button className="btn btn-primary w-100" type="submit">Join Room</button>
          </form>
        </div>
      </>
    );
  }

  return (
    <AnonymousChatTabs roomName={roomName} username={username} socket={socket} {...props} />
  );
}
