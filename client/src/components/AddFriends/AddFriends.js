import React, { useContext, useState, useEffect } from "react";
import axios from "axios";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FcSearch } from "react-icons/fc";

import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";

import { UsersContext } from "../../context/UsersContext";
import { FriendsContext } from "../../context/FriendsContext";
import { NotificationsContext } from "../../context/NotificationsContext";

import "./AddFriends.css";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function AddFriends(props) {
  const { users, fetchAllUsers } = useContext(UsersContext); // Access users and fetchAllUsers from UsersContext
  const { setUpdatedFriends } = useContext(FriendsContext); // Access FriendsContext to update friends
  const { addNotification } = useContext(NotificationsContext); // Access NotificationsContext to add new notifications

  const [search, setSearch] = useState("");

  const options = Utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);

  const currentUser = JSON.parse(Utils.getItemFromLocalStorage("current_user"));

  useEffect(() => {
    if (props.show) {
      fetchAllUsers(); // Fetch users when the modal is shown
    }
  }, [props.show, fetchAllUsers]); // Re-run when the modal opens

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

    const addUser = { username };

    try {
      const response = await axios.post(
        `${apiBaseUrl}/user/addFriend`,
        addUser,
        reqConfig
      );

      if (response?.data?.data) {
        // Update FriendsContext with the new friend data
        setUpdatedFriends(response.data.data);

        // Fetch the updated list of users from the server
        fetchAllUsers();

        // Add notification for the target user (the friend being added)
        const notification = {
          message: `${currentUser.username} added you as a friend.`,
          type: 'friend-request',
          sender: currentUser.username,
          receiver: addUser.username, // This should be the user being added
          timestamp: new Date().toISOString(),
        };

        // Send notification to the right user
        addNotification(notification);

        // Show success toastr
        const successOptions = Utils.getSuccessToastrOptions(response.data.message);
        setToaster(successOptions);
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      // You can show an error toastr if necessary
    }
  };

  return (
    <>
      <Toastr
        show={toastr.show}
        onHide={handleOnHide}
        variant={toastr.variant}
        title={toastr.title}
        message={toastr.message}
      />
      <Modal show={props.show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Friends</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup className={search ? "add-friend" : ""}>
            <ListGroup.Item>
              <InputGroup className="search">
                <Form.Control
                  type="text"
                  placeholder="Search username..."
                  aria-label="Search username"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="outline-secondary" id="search" onClick={handleSearch}>
                  <FcSearch />
                </Button>
              </InputGroup>
            </ListGroup.Item>

            {/* Filter users based on search */}
            {users
              .filter((usernames) => search && usernames.toLowerCase().includes(search.toLowerCase())) // Case-insensitive search
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