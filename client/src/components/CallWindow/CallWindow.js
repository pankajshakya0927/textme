import React, { useEffect, useRef, useCallback } from "react";
import "./CallWindow.css";

export default function CallWindow({ type, onClose, socket, peerUser, isCaller, offer }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pc = useRef(null);

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

  useEffect(() => {
    const rtc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.current = rtc;

    rtc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("💧 Sending ICE candidate");
        socket.emit("ice-candidate", { to: peerUser, candidate: event.candidate });
      }
    };

    rtc.ontrack = (event) => {
      console.log("✅ ontrack fired — remote stream received");
      if (remoteRef.current) {
        remoteRef.current.srcObject = event.streams[0];
      }
    };

    rtc.onconnectionstatechange = () => {
      console.log("🔗 Connection state:", rtc.connectionState);
    };

    // Setup local stream and add tracks
    const setupStreamAndConnect = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });
        window.localStream = stream;

        if (localRef.current) {
          localRef.current.srcObject = stream;
          console.log("🎥 Local stream attached");
        }

        stream.getTracks().forEach(track => {
          console.log("🎤 Adding local track:", track.kind);
          rtc.addTrack(track, stream);
        });

        if (isCaller) {
          console.log("📞 Creating offer as caller");
          const offer = await rtc.createOffer();
          await rtc.setLocalDescription(offer);
          console.log("📨 Sending offer");
          socket.emit("call-user", { to: peerUser, offer });
        } else if (offer) {
          console.log("📥 Receiver setting remote description");
          await rtc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await rtc.createAnswer();
          await rtc.setLocalDescription(answer);
          socket.emit("make-answer", { to: peerUser, answer });
          console.log("📤 Sent answer to caller");
        }
      } catch (err) {
        console.error("❌ Error setting up stream or SDP:", err);
        alert("Camera/Microphone error or SDP problem");
        hangUp();
      }
    };

    // Listen for answer from remote (caller side)
    socket.on("answer-made", async ({ from, answer }) => {
      console.log("📨 Received answer-made event:", { from, answer, peerUser });
      if (from !== peerUser) return;
      try {
        console.log("📥 Caller received answer — setting remote description");
        await rtc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("❌ Error setting remote description on answer:", err);
      }
    });

    // Listen for ICE candidates from remote
    socket.on("ice-candidate", async ({ from, candidate }) => {
      if (from !== peerUser) return;
      try {
        await rtc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("💧 ICE candidate added");
      } catch (e) {
        console.error("❌ Failed to add ICE candidate", e);
      }
    });

    setupStreamAndConnect();

    return () => {
      console.log("🧹 Cleaning up call");
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
          <>
            <video ref={localRef} autoPlay playsInline className="call-video" />
            <video ref={remoteRef} autoPlay playsInline className="call-video" />
          </>
        )}
        {type === "audio" && <div className="call-status">🎧 Audio call in progress...</div>}
        <button onClick={hangUp} className="call-hangup">Hang Up</button>
      </div>
    </div>
  );
}