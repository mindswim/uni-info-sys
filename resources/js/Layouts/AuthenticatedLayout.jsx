import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-vh-100 d-flex flex-column">
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} href="/">
                        <ApplicationLogo className="d-inline-block align-top" width="30" height="30" />
                        {' '}My App
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} href={route('dashboard')} active={route().current('dashboard')}>
                                Dashboard
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                                    {auth.user.name}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} href={route('profile.edit')}>Profile</Dropdown.Item>
                                    <Dropdown.Item as={Link} href={route('logout')} method="post" as="button">Log Out</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main className="flex-grow-1">
                {header && (
                    <header className="bg-white shadow-sm mb-4">
                        <Container className="py-3">
                            {header}
                        </Container>
                    </header>
                )}

                <Container>
                    {children}
                </Container>
            </main>

            <footer className="bg-light text-center text-muted py-3 mt-4">
                <Container>
                    &copy; 2023 My App. All rights reserved.
                </Container>
            </footer>
        </div>
    );
}
