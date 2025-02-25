import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { Navbar, Container, Nav, Offcanvas, Button, NavDropdown, ButtonGroup } from "react-bootstrap";
import { HiUserAdd } from "react-icons/hi";
import { MdNotifications } from "react-icons/md";

import AddFriends from "../AddFriends/AddFriends";
import { AuthContext } from "../../context/AuthContext";
import Toastr from "../Toastr/Toastr";
import Utils from "../../shared/Utils";
import "./Navbar.css"; // Add a CSS file for additional styles if needed

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function NavbarOffCanvas() {
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [navExpanded, setNavExpanded] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const shouldFetch = useRef(true);
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

  // Fetch all users when logged in
  useEffect(() => {
    if (isLoggedIn && shouldFetch.current) {
      shouldFetch.current = false;
      fetchAllUsers();
    }
  }, [isLoggedIn]);

  const fetchAllUsers = async () => {
    try {
      const access_token = Utils.getItemFromLocalStorage("access_token");
      const reqConfig = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      };

      const response = await axios.get(`${apiBaseUrl}/user/fetchAllUsers`, reqConfig);
      if (response?.data?.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      const errorOptions = Utils.getErrorToastrOptions(error.response?.data?.error, error.response?.data?.message);
      setToaster(errorOptions);
    }
  };

  return (
    <>
      {/* Add Friends Modal */}
      <AddFriends show={show} users={users} onHide={handleHideAddFriends} />

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
              <Button variant="primary">
                <MdNotifications size={24} />
              </Button>
            </ButtonGroup>
          )}

          {/* Navbar Toggle Button */}
          <Navbar.Toggle aria-controls="offcanvasNavbar" onClick={() => setNavExpanded((prev) => !prev)} />

          {/* Offcanvas Sidebar */}
          <Navbar.Offcanvas id="offcanvasNavbar" placement="end">
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