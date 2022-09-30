import React from "react";

import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";

function Toastr(props) {
  const handleClose = () => {
    props.onHide();
  };

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast show={props.show} onClose={handleClose} delay={5000} autohide className="d-inline-block m-1" bg={props.variant.toLowerCase()}>
        <Toast.Header>
          <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
          <strong className="me-auto">{props.title}</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{props.message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default Toastr;
