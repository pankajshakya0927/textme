import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FiPhone, FiPhoneOff } from "react-icons/fi";
import "./IncomingCallModal.css";

export default function IncomingCallModal({ show, from, onAccept, onReject }) {
  return (
    <Modal show={show} centered contentClassName="incoming-call-modal">
      <Modal.Header className="incoming-call-header" closeButton={false}>
        <Modal.Title className="w-100 text-center">Incoming Call</Modal.Title>
      </Modal.Header>
      <Modal.Body className="incoming-call-body text-center">
        <div className="caller-avatar mb-3">📞</div>
        <div className="caller-name mb-2">{from} is calling you...</div>
      </Modal.Body>
      <Modal.Footer className="incoming-call-footer d-flex justify-content-center gap-4">
        <Button
          variant="danger"
          onClick={onReject}
          className="call-btn hangup-btn"
          title="Reject Call"
          aria-label="Reject Call"
        >
          <FiPhoneOff size={24} />
        </Button>
        <Button
          variant="success"
          onClick={onAccept}
          className="call-btn accept-btn"
          title="Accept Call"
          aria-label="Accept Call"
        >
          <FiPhone size={24} />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}