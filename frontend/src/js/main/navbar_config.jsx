import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { useLocation } from 'react-router-dom';

export default function NavbarMaker({user, setUser}) {
  const location = useLocation();
  const {pathname} = location;

  const navbarOptionsController = (pathname) => {
    if (pathname === "/police/login") {
      return <Nav.Link className="top-nav-bar-link" href="/home">Go Back</Nav.Link>
    }
    else if (/\/police.*/.test(pathname)) {
      return <Nav.Link className="navbar-login-logout top-nav-bar-link" href="/home">LogOut</Nav.Link>
    }
    else {
      return (
        <>
          <Nav.Link className="top-nav-bar-link" href="/home">Home</Nav.Link>
          <Nav.Link className="top-nav-bar-link" href="/report">Report an Incident</Nav.Link>
          <Nav.Link className="navbar-login-logout top-nav-bar-link" href="/police/login">Police Log In</Nav.Link>
        </>)
    }
  }
  
  return (
    <>
      <Navbar className="navbar" expand="md" bg="dark" variant="dark">
          <Navbar.Brand href="/police">Police</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {navbarOptionsController(pathname)}
            </Nav>
          </Navbar.Collapse>
      </Navbar>
    </>
  )
}