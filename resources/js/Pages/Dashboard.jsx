import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <Container fluid>
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title as="h4" className="mb-4">Welcome to Your Dashboard</Card.Title>
                                <Card.Text>
                                    You're logged in! This is your personalized dashboard where you can manage your account and access various features of the application.
                                </Card.Text>
                                <Button variant="primary" href={route('profile.edit')}>Edit Profile</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
}
