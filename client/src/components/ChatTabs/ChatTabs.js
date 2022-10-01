import React, { useState, useEffect } from "react";
import axios from "axios";

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
import "./ChatTabs.css";

function ChatTabs() {
  const [friends, setFriends] = useState([]);

  const options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const handleOnHide = () => {
    setToaster(options);
  };

  useEffect(() => {
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
        if (resp && resp.data && resp.data.data) setFriends(resp.data.data);
      })
      .catch((error) => {
        const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
        setToaster(errorOptions);
      });
  }, []);

  return (
    <Tab.Container id="list-group-tabs" defaultActiveKey="#link1">
      <Toastr show={toastr.show} onHide={handleOnHide} variant={toastr.variant} title={toastr.title} message={toastr.message} />
      <Row className="tabs g-1">
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
                <ListGroup.Item key={key}>
                  <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/100/50/50" data-holder-rendered="true" />
                  <span>{friend}</span>
                </ListGroup.Item>
              ))}
            </div>
          </ListGroup>
        </Col>
        <Col sm={8}>
          <Tab.Content>
            <Tab.Pane eventKey="#link1">
              <ChatBox message="link1" />
            </Tab.Pane>
            <Tab.Pane eventKey="#link2">
              <ChatBox message="link2" />
            </Tab.Pane>
            <Tab.Pane eventKey="#link3">
              <ChatBox message="link3" />
            </Tab.Pane>
            <Tab.Pane eventKey="#link4">
              <ChatBox message="link4" />
            </Tab.Pane>
            <Tab.Pane eventKey="#link5">
              <ChatBox message="link5" />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default ChatTabs;
