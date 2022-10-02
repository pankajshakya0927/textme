import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import ChatBox from "../ChatBox/ChatBox";
import { FcSearch } from "react-icons/fc";

import Toastr from "../Toastr/Toastr";
import utils from "../../shared/utils";
import config from "../../configurations/config";
import { FriendsContext } from "../../context/FriendsContext";
import "./ChatTabs.css";

function ChatTabs() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState();
  const { updatedFriends } = useContext(FriendsContext);

  const history = useHistory();

  const options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const handleOnHide = () => {
    setToaster(options);
  };

  console.log(updatedFriends, " from chat tabs", friends);
  if (updatedFriends) {
    // setFriends(updatedFriends);
  }
  
  useEffect(() => {
    const loggedIn = utils.isLoggedIn();

    if (loggedIn) {
      const access_token = utils.getItemFromLocalStorage("access_token");
      const reqConfig = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      };

      axios
        .get(`${config.apiBaseUrl}/user/getFriends`, reqConfig)
        .then((resp) => {
          if (resp && resp.data && resp.data.data) {
            setFriends(resp.data.data);
            setSelectedFriend(friends[0]);
          }
        })
        .catch((error) => {
          const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
          setToaster(errorOptions);
          history.push("/login");
          utils.logout();
        });
    }
  }, []);

  const handleSelectFriend = (friend, e) => {
    e.preventDefault();
    setSelectedFriend(friend.username);
    if (updatedFriends) setFriends(updatedFriends);
  };

  return (
    <>
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Tab.Container id="list-group-tabs">
        <Row className={friends && friends.length ? "tabs g-1" : "hide"}>
          <Col sm={4}>
            <ListGroup>
              <ListGroup.Item>
                <InputGroup className="search">
                  <Form.Control placeholder="Search..." aria-label="Search" />
                  <Button variant="outline-secondary" id="search">
                    <FcSearch />
                  </Button>
                </InputGroup>
              </ListGroup.Item>
              <div className="chatName">
                {friends.map((friend, key) => (
                  <ListGroup.Item key={key} action href={friend.username} onClick={(e) => handleSelectFriend(friend, e)}>
                    <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/100/50/50" data-holder-rendered="true" />
                    <span>{friend.username}</span>
                  </ListGroup.Item>
                ))}
              </div>
            </ListGroup>
          </Col>
          <Col sm={8}>
            <Tab.Content>
              <Tab.Pane eventKey={selectedFriend}>
                <ChatBox message={selectedFriend} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>

        <div className={friends && friends.length ? "hide" : "container"}>
          <h5>
            Hi there!{" "}
            <span role="img" aria-label="wave" className="wave">
              👋
            </span>{" "}
            Welcome to TextMe. Add your first friend to get the fun started.
          </h5>
        </div>
      </Tab.Container>
    </>
  );
}

export default ChatTabs;
