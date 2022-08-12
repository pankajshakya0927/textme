import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import ChatBox from "../ChatBox/ChatBox";
import { FcSearch } from "react-icons/fc";
import "./ChatTabs.css";

function ChatTabs() {
  return (
    <Tab.Container id="list-group-tabs" defaultActiveKey="#link1">
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
              <ListGroup.Item action href="#link1">
                <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/100/50/50" data-holder-rendered="true" />
                <span>Link 1</span>
              </ListGroup.Item>
              <ListGroup.Item action href="#link2">
                <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/200/50/50" data-holder-rendered="true" />
                Link 2
              </ListGroup.Item>
              <ListGroup.Item action href="#link3">
                <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/300/50/50" data-holder-rendered="true" />
                Link 3
              </ListGroup.Item>
              <ListGroup.Item action href="#link4">
                <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/400/50/50" data-holder-rendered="true" />
                Link 4
              </ListGroup.Item>
              <ListGroup.Item action href="#link5">
                <img className="rounded-circle" alt="50x50" src="https://picsum.photos/id/500/50/50" data-holder-rendered="true" />
                Link 5
              </ListGroup.Item>
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
