import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Navbar, Container, Nav, Offcanvas, Button, NavDropdown, ButtonGroup, Badge, Dropdown, ListGroup } from "react-bootstrap";
import { HiUserAdd } from "react-icons/hi";
import { MdNotifications } from "react-icons/md";

import { AuthContext } from "../../context/AuthContext";
import { NotificationsContext } from "../../context/NotificationsContext";

import AddFriends from "../AddFriends/AddFriends";
import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import "./Navbar.css";

function NavbarOffCanvas() {
  const [show, setShow] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { getNotificationsForUser, markNotificationAsRead } = useContext(NotificationsContext);

  const history = useHistory();
  const toastrOptions = Utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(toastrOptions);

  const currentUser = JSON.parse(Utils.getItemFromLocalStorage("current_user"));
  const userNotifications = currentUser ? getNotificationsForUser(currentUser.username) : [];

  // Toggle Add Friends modal
  const handleShowAddFriends = () => setShow(true);
  const handleHideAddFriends = () => setShow(false);

  // Close Navbar when navigating
  const closeNavBar = () => setNavExpanded(false);

  // Navigate to pages
  const navigateTo = (path) => {
    history.push(path);
    closeNavBar();
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    Utils.logout();
    navigateTo("/login");
  };

  return (
    <>
      {/* Add Friends Modal */}
      <AddFriends show={show} onHide={handleHideAddFriends} />

      {/* Toastr Notifications */}
      <Toastr show={toastr.show} onHide={() => setToaster(toastrOptions)} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      <Navbar bg="primary" variant="dark" expand="md" expanded={navExpanded}>
        <Container fluid>
          <div className="d-flex align-items-center gap-3">
            {/* Brand Name */}
            <Navbar.Brand onClick={() => navigateTo("/")} className="pointer">
              TextMe
            </Navbar.Brand>

            {/* Right-side controls */}
            {isLoggedIn && (
              <ButtonGroup className="d-flex align-items-center">
                <Button variant="primary" onClick={handleShowAddFriends}>
                  <HiUserAdd size={24} />
                </Button>

                {/* Notifications Dropdown */}
                <Dropdown show={showNotificationsDropdown} onToggle={(isOpen) => setShowNotificationsDropdown(isOpen)}>
                  <Dropdown.Toggle as={Button} variant="primary" className="position-relative">
                    <MdNotifications size={24} />
                    {userNotifications.filter(notification => !notification.isRead).length > 0 && (
                      <Badge bg="danger" pill className="position-absolute" style={{ top: 5, right: 5 }}>
                        {userNotifications.filter(notification => !notification.isRead).length}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    align="start"  // Align dropdown towards the right
                    style={{ minWidth: "300px" }}
                    container="body"  // Ensures dropdown is placed correctly
                    popperConfig={{
                      modifiers: [
                        { name: "preventOverflow", options: { boundary: "window" } }, // Prevents clipping
                        { name: "flip", options: { fallbackPlacements: ["bottom-start", "bottom-end"] } } // Adjusts position dynamically
                      ]
                    }}>
                    <Dropdown.Header>Notifications</Dropdown.Header>

                    {userNotifications.length === 0 ? (
                      <Dropdown.Item disabled>No new notifications</Dropdown.Item>
                    ) : (
                      <ListGroup
                        variant="flush"
                        style={{
                          maxHeight: "300px",  // Set a max height for the list
                          overflowY: "auto",   // Enable vertical scrolling
                        }}
                      >
                        {userNotifications.length > 0 ? (
                          userNotifications.map((notification, index) => (
                            <ListGroup.Item
                              key={index}
                              action
                              onClick={() => {
                                // Only mark as read if the notification is unread
                                if (!notification.isRead) {
                                  markNotificationAsRead(notification._id);
                                }
                              }}
                              style={{
                                cursor: "pointer",
                                backgroundColor: notification.isRead ? "#f8f9fa" : "#0d6efd", // Gray for read, Primary blue for unread
                                color: notification.isRead ? "black" : "white", // Black text for read, White for unread
                              }}
                            >
                              {notification.message}
                              <small
                                style={{
                                  fontSize: "0.7rem",
                                  display: "block",
                                  textAlign: "right",
                                }}
                              >
                                {Utils.timeAgo(notification.createdAt)}
                              </small>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <Dropdown.Item disabled>No new notifications</Dropdown.Item>
                        )}
                      </ListGroup>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </ButtonGroup>
            )}
          </div>

          {/* Navbar Toggle Button on the Right */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" className="ms-auto" onClick={() => setNavExpanded((prev) => !prev)} />

          {/* Offcanvas Sidebar */}
          <Navbar.Offcanvas id="offcanvasNavbar" placement="end" show={navExpanded} onHide={() => setNavExpanded(false)}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>TextMe</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link onClick={() => navigateTo("/")}>Home</Nav.Link>

                {isLoggedIn ? (
                  <NavDropdown title={currentUser.username} align="end">
                    <NavDropdown.Item onClick={() => navigateTo("/profile")}>Profile</NavDropdown.Item>
                    <NavDropdown.Item onClick={() => navigateTo("/settings")}>Settings</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <div>
                    <Button variant="primary" onClick={() => navigateTo("/login")}>
                      Log in
                    </Button>
                    <Button variant="outline-light" onClick={() => navigateTo("/signup")}>
                      Sign up
                    </Button>
                  </div>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar >
    </>
  );
}

export default NavbarOffCanvas;