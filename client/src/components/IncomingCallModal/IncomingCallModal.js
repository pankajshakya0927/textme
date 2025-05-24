import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function IncomingCallModal({ show, from, onAccept, onReject }) {
  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title>Incoming Call</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>📞 {from} is calling you...</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onReject}>Reject</Button>
        <Button variant="success" onClick={onAccept}>Accept</Button>
      </Modal.Footer>
    </Modal>
  );
}