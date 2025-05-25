import React, { useEffect, useRef, useCallback, useState } from "react";
import { Button } from "react-bootstrap";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from "react-icons/fi";
import "./CallWindow.css";

export default function CallWindow({ type, onClose, socket, peerUser, isCaller, offer }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pc = useRef(null);
  const alreadyConnected = useRef(false);

  // New states to control mic and video mute/unmute
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  const hangUp = useCallback(() => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
      window.localStream = null;
    }
    socket.emit("call-ended", { to: peerUser });
    onClose();
  }, [peerUser, socket, onClose]);

  // Toggle microphone mute/unmute
  const toggleMic = () => {
    if (!window.localStream) return;
    const enabled = !micMuted;
    window.localStream.getAudioTracks().forEach(track => {
      track.enabled = !enabled; // toggle track.enabled properly
    });
    setMicMuted(enabled);
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (!window.localStream) return;
    const enabled = !videoOff;
    window.localStream.getVideoTracks().forEach(track => {
      track.enabled = !enabled;
    });
    setVideoOff(enabled);
  };

  useEffect(() => {
    const rtc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.current = rtc;

    rtc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the remote peer via socket
        socket.emit("ice-candidate", { to: peerUser, candidate: event.candidate });
      }
    };

    rtc.ontrack = (event) => {
      // Handle remote media stream once received
      const [stream] = event.streams;
      if (type === "video" && remoteRef.current) {
        remoteRef.current.srcObject = stream;
      } else if (type === "audio" && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    rtc.onconnectionstatechange = () => {
      // Monitor connection state changes for debugging or UI updates
    };

    // Setup local media stream and establish WebRTC connection
    const setupStreamAndConnect = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: {
            echoCancellation: true,       // ✅ Reduces echo/feedback between mic and speaker
            noiseSuppression: false,    // Disabled to avoid cutting out voices when both talk
            // noiseSuppression: true,       // ✅ Suppresses constant background noise (e.g., fans, typing)
            autoGainControl: false,       // ❌ Leave off for consistent volume during overlaps
            channelCount: 1,              // ✅ Mono is sufficient for voice and more compatible
            sampleRate: 48000,            // ✅ Standard for Opus codec (used in WebRTC)
            sampleSize: 16,               // ✅ 16-bit depth is widely supported
            latency: 0.01,                // ⚠️ Low latency helps, but not always honored
            volume: 1.0                   // ✅ Full mic volume (can be adjusted if needed)
          }
        });
        window.localStream = stream;

        if (type === "audio") {
          stream.getAudioTracks().forEach(track => {
            track.enabled = true; // ensure audio track is on
          });
        }

        // Attach the local media stream to the local video element
        if (localRef.current) {
          localRef.current.srcObject = stream;
        }

        // Add local media tracks to the RTCPeerConnection
        stream.getTracks().forEach(track => {
          rtc.addTrack(track, stream);
        });

        if (isCaller) {
          // Create and send an offer if this client is the caller
          const offer = await rtc.createOffer();
          await rtc.setLocalDescription(offer);
          socket.emit("call-user", { to: peerUser, offer });
        } else if (offer) {
          // Set remote description with offer and send an answer if receiver
          await rtc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await rtc.createAnswer();
          await rtc.setLocalDescription(answer);
          socket.emit("make-answer", { to: peerUser, answer });
        }
      } catch (err) {
        console.error("Media or SDP error:", err);
        alert("Camera/Microphone error or SDP problem");
        hangUp();
      }
    };

    // Listen for answer from remote peer (caller side)
    socket.on("answer-made", async ({ from, answer }) => {
      if (from !== peerUser) return;
      try {
        // Set remote description with received answer
        await rtc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        // Errors setting remote description are silently ignored here
      }
    });

    // Listen for ICE candidates from remote peer
    socket.on("ice-candidate", async ({ from, candidate }) => {
      if (from !== peerUser) return;
      try {
        // Add the received ICE candidate to the RTCPeerConnection
        await rtc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        // Errors adding ICE candidates are silently ignored here
      }
    });

    // Prevent duplicate connection attempts due to re-renders or prop changes
    if (!alreadyConnected.current) {
      alreadyConnected.current = true;
      setupStreamAndConnect();
    }

    return () => {
      // Cleanup: hang up call and remove socket listeners
      hangUp();
      socket.off("answer-made");
      socket.off("ice-candidate");
    };
  }, [type, socket, peerUser, isCaller, offer, hangUp]);

  return (
    <div className="call-window-backdrop">
      <div className="call-window">
        <h2>{type === "video" ? "Video Call" : "Audio Call"}</h2>

        {type === "video" && (
          <div className="video-container">
            <video
              ref={remoteRef}
              autoPlay
              playsInline
              className="call-video remote-video"
            />
            <video
              ref={localRef}
              muted
              autoPlay
              playsInline
              className="call-video local-video"
            />
          </div>
        )}

        {type === "audio" && (
          <>
            <div className="call-status">🎧 Audio call in progress...</div>
            <audio ref={remoteAudioRef} autoPlay playsInline />
          </>
        )}

        {/* Controls for mute/unmute and video on/off */}
        <div className="call-controls">
          <Button
            variant={micMuted ? "danger" : "light"}
            onClick={toggleMic}
            title={micMuted ? "Unmute Microphone" : "Mute Microphone"}
            aria-label={micMuted ? "Unmute Microphone" : "Mute Microphone"}
            className="call-btn"
          >
            {micMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
          </Button>

          {type === "video" && (
            <Button
              variant={videoOff ? "danger" : "light"}
              onClick={toggleVideo}
              title={videoOff ? "Turn Video On" : "Turn Video Off"}
              aria-label={videoOff ? "Turn Video On" : "Turn Video Off"}
              className="call-btn"
            >
              {videoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
            </Button>
          )}

          <Button
            variant="danger"
            onClick={hangUp}
            title="Hang Up"
            aria-label="Hang Up"
            className="call-btn hangup-btn"
          >
            <FiPhoneOff size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}