"use client";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { signIn } from "next-auth/react";

export function NavbarLite() {
    const handleSignIn = async () => {
        await signIn("google", { callbackUrl: "/miequipo" });
    };

    return (
        <Navbar expand="lg" className="bg-body-tertiary"  >
            <Container fluid style={{background:"#091442" }} >
                <Navbar.Brand href="/" style={{ color:"white" }} ><strong>Estadio Fantasy</strong></Navbar.Brand>
                <Nav className="ms-auto" style={{  background:"white",display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <Button onClick={handleSignIn} variant="outline-success">Identifíquese</Button>
                </Nav>
            </Container>
        </Navbar>
    );
}
