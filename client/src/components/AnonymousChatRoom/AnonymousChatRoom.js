import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AnonymousChatTabs from "./AnonymousChatTabs";
import socket from "../../utils/socket";

function getStoredAnonymousUsername(roomName) {
  return localStorage.getItem(`anonymous_username_${roomName}`) || "";
}
function setStoredAnonymousUsername(roomName, username) {
  localStorage.setItem(`anonymous_username_${roomName}`, username);
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
    setError("");
  }

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
