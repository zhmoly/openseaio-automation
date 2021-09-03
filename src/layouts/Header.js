import React, { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';

const Header = (props) => {

    return (
        <Navbar collapseOnSelect expand="lg" bg="light">
            <Container>
                <Navbar.Brand href="/">Opensea.io Automator</Navbar.Brand>
                <Navbar.Toggle aria-controls="nav-bar" />
                <Navbar.Collapse id="nav-bar">
                    <Nav className="me-auto">
                        <Nav.Link href="/buy">Buy Automation</Nav.Link>
                        <Nav.Link href="/offer">Offer Automation</Nav.Link>
                        <Nav.Link href="/collection">Collection Monitor</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
