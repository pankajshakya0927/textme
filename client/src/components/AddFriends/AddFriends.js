import React, { useContext, useState } from "react";
import axios from "axios";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FcSearch } from "react-icons/fc";

import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import { FriendsContext } from "../../context/FriendsContext";
import "./AddFriends.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function AddFriends(props) {
  const { setUpdatedFriends } = useContext(FriendsContext);
  const [search, setSearch] = useState();

  const options = Utils.getDefaultToastrOptions();
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

  const handleAddFriend = async (username) => {
    const access_token = Utils.getItemFromLocalStorage("access_token");
    const reqConfig = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const addUser = {
      username: username,
    };

    await axios
      .post(`${apiBaseUrl}/user/addFriend`, addUser, reqConfig)
      .then((resp) => {
        if (resp && resp.data) {
          setUpdatedFriends(resp.data.data);
          const successOptions = Utils.getSuccessToastrOptions(resp.data.message);
          setToaster(successOptions);
        }
      })
      .catch((error) => {
        console.log(error);
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
          <ListGroup className={search ? "add-friend" : ""}>
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
