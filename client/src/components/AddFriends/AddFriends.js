import React, { useState } from "react";
import axios from "axios";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FcSearch } from "react-icons/fc";

import Toastr from "../Toastr/Toastr";
import config from "../../configurations/config";
import utils from "../../shared/utils";
import "./AddFriends.css";

function AddFriends(props) {
  const [search, setSearch] = useState();

  const options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const handleOnHide = () => {
    setToaster(options);
  };

  const handleSearch = () => {
    setSearch(search);
  };

  const handleClose = () => {
    setSearch("");
    props.onHide();
  };

  const handleAddFriend = (username) => {
    const access_token = utils.getItemFromLocalStorage("access_token");
    const reqConfig = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const addUser = {
      username: username,
    };

    axios
      .post(`${config.apiBaseUrl}/user/addFriend`, addUser, reqConfig)
      .then((resp) => {
        if (resp && resp.data) {
          utils.setItemToLocalStorage("friends", JSON.stringify(resp.data.data));
          const successOptions = utils.getSuccessToastrOptions(resp.data.message);
          setToaster(successOptions);
        }
      })
      .catch((error) => {
        const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
        setToaster(errorOptions);
      });
  };

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Modal show={props.show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Friends</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>
              <InputGroup className="search">
                <Form.Control type="text" placeholder="Search username..." aria-label="Search username" onChange={(e) => setSearch(e.target.value)} />
                <Button variant="outline-secondary" id="search" onClick={handleSearch}>
                  <FcSearch />
                </Button>
              </InputGroup>
            </ListGroup.Item>
            {props.users
              .filter((usernames) => search && usernames.includes(search))
              .map((user, key) => (
                <ListGroup.Item key={key} className="users-list">
                  <span>{user}</span>
                  <Button variant="primary" onClick={() => handleAddFriend(user)}>
                    Add
                  </Button>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddFriends;
