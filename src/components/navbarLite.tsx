import { Navbar, Nav, Container } from "react-bootstrap";
import LoginButton from "./LoginButton";

export function NavbarLite() {
    return (
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid style={{ background: "#091442" }}>
          <Navbar.Brand href="/" style={{ color: "white" }}>
            <strong>Estadio Fantasy</strong>
          </Navbar.Brand>
          <Nav className="ms-auto" style={{ background: "white", display: "flex", flexDirection: "row", alignItems: "center" }}>
            <LoginButton />
          </Nav>
        </Container>
      </Navbar>
    );
  }
  