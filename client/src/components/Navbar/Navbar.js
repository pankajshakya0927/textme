import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { HiUserAdd } from "react-icons/hi";
import { MdNotifications } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";

import AddFriends from "../AddFriends/AddFriends";
import { AuthContext } from "../../context/AuthContext";
import Toastr from "../Toastr/Toastr";
import utils from "../../shared/Utils";
import config from "../../configurations/config";

function NavbarOffCanvas() {
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const history = useHistory();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const shouldFetch = useRef(true); // useEffect runs twice thereby calling the api twice, this will avoid that

  let options = utils.getDefaultToastrOptions();
  const [toastr, setToaster] = useState(options);
  const current_user = JSON.parse(utils.getItemFromLocalStorage('current_user'));

  const handleOnShow = () => [setShow(true)];
  const handleOnHide = () => [setShow(false)];

  const handleOnHideToastr = () => {
    setToaster(options);
  };

  const [navExpanded, setNavExpanded] = useState(false);
  const closeNavBar = () => {
    setNavExpanded(false);
  }

  const handleLogin = () => {
    history.push("/login");
    closeNavBar();
  }

  const handleSignup = () => {
    history.push("/signup");
    closeNavBar();
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    history.push("/login");
    utils.logout();
  }

  useEffect(() => {
    fetchAllUsers();
  }, [isLoggedIn]);

  const fetchAllUsers = async () => {
    if (isLoggedIn && shouldFetch.current) {
      shouldFetch.current = false;
      const access_token = utils.getItemFromLocalStorage("access_token");

      const reqConfig = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      };

      await axios
        .get(`${config.apiBaseUrl}/user/fetchAllUsers`, reqConfig)
        .then((resp) => {
          if (resp && resp.data && resp.data.data) setUsers(resp.data.data);
        })
        .catch((error) => {
          const errorOptions = utils.getErrorToastrOptions(error.response.data.error, error.response.data.message);
          setToaster(errorOptions);
        });
    }
  }

  const navigateTo = (path) => {
    history.push(path);
    closeNavBar();
  }

  return (
    <>
      <AddFriends show={show} users={users.length ? users : []} onHide={handleOnHide}></AddFriends>
      <Toastr show={toastr.show} onHide={handleOnHideToastr} variant={toastr.variant} title={toastr.title} message={toastr.message} />

      {["md"].map((expand) => (
        <Navbar sticky="top" bg="primary" variant="dark" key={expand} expand={expand} expanded={navExpanded}>
          <Container fluid>
            <Navbar.Brand href="#">TextMe</Navbar.Brand>
            {isLoggedIn ? (
              <div>
                <ButtonGroup aria-label="Controls" style={{ marginRight: "10px" }}>
                  <Button variant="primary" onClick={handleOnShow}>
                    <HiUserAdd size={28} />
                  </Button>
                  <Button variant="primary">
                    <MdNotifications size={28} />
                  </Button>
                </ButtonGroup>
              </div>
            ) : null}
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} onClick={() => setNavExpanded(navExpanded ? false : "expanded")}/>
            <Navbar.Offcanvas id={`offcanvasNavbar-expand-${expand}`} aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`} placement="end">
              <Offcanvas.Header>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>TextMe</Offcanvas.Title>
              <AiOutlineClose className="pointer" size={28} onClick={closeNavBar} />
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3">
                  <Nav.Link onClick={() => navigateTo('/')}>Home</Nav.Link>
                  {/* <Nav.Link>Contact Us</Nav.Link> */}
                  {isLoggedIn ? (
                    <NavDropdown title={current_user.username} align="end" id={`offcanvasNavbarDropdown-expand-${expand}`}>
                      {/* <NavDropdown.Item>Update Profile</NavDropdown.Item>
                      <NavDropdown.Item>Account Settings</NavDropdown.Item> */}
                      {/* <NavDropdown.Divider /> */}
                      <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <>
                      <Button variant="primary" onClick={handleLogin}>Log in</Button>
                      <Button variant="light" onClick={handleSignup}>Sign up</Button>
                    </>
                  )}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default NavbarOffCanvas;
