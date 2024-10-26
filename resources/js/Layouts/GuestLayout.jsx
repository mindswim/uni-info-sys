import React from 'react';
import { Link } from '@inertiajs/react';
import { Container, Row, Col } from 'react-bootstrap';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
            <Row className="w-100">
                <Col xs={12} md={6} lg={4} className="mx-auto">
                    <div className="text-center mb-4">
                        <Link href="/">
                            <ApplicationLogo className="w-20 h-20" />
                        </Link>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        {children}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
