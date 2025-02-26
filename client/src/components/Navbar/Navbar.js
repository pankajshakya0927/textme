import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";

import { Navbar, Container, Nav, Offcanvas, Button, NavDropdown, ButtonGroup, Badge } from "react-bootstrap";
import { HiUserAdd } from "react-icons/hi";
import { MdNotifications } from "react-icons/md";

import AddFriends from "../AddFriends/AddFriends";

import { AuthContext } from "../../context/AuthContext";

import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import "./Navbar.css"; // Add a CSS file for additional styles if needed

function NavbarOffCanvas() {
  const [show, setShow] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const history = useHistory();

  const toastrOptions = Utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(toastrOptions);
  const currentUser = JSON.parse(Utils.getItemFromLocalStorage("current_user"));

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

      <Navbar bg="primary" variant="dark" expand="md" sticky="top" expanded={navExpanded}>
        <Container fluid>
          {/* Brand Name */}
          <Navbar.Brand onClick={() => navigateTo("/")} className="pointer">
            TextMe
          </Navbar.Brand>

          {/* Right-side controls */}
          {isLoggedIn && (
            <ButtonGroup className="d-flex align-items-center gap-2">
              <Button variant="primary" onClick={handleShowAddFriends}>
                <HiUserAdd size={24} />
              </Button>

              <Button variant="primary" className="position-relative">
                <MdNotifications size={24} />
              </Button>
            </ButtonGroup>
          )}

          {/* Navbar Toggle Button */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={() => setNavExpanded((prev) => !prev)} />

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
      </Navbar>
    </>
  );
}

export default NavbarOffCanvas;