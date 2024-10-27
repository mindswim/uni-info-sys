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
            
            <Container fluid className="py-4">
                {/* Stats Row */}
                <Row className="g-4 mb-4">
                    <Col xs={12} md={4}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Total Students</Card.Title>
                                <Card.Text className="h2">150</Card.Text>
                                <Button variant="primary" href={route('students.index')}>View Students</Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Active Programs</Card.Title>
                                <Card.Text className="h2">12</Card.Text>
                                <Button variant="success" href={route('programs.index')}>View Programs</Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title>Pending Applications</Card.Title>
                                <Card.Text className="h2">45</Card.Text>
                                <Button variant="info">Review Applications</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Content Row */}
                <Row className="g-4">
                    <Col xs={12} md={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>Recent Activity</Card.Title>
                                <Card.Text>
                                    <ul className="list-unstyled">
                                        <li className="mb-2">✅ New student application received</li>
                                        <li className="mb-2">📚 Program "Computer Science" updated</li>
                                        <li className="mb-2">👤 New student registered</li>
                                        <li className="mb-2">📝 Document verification completed</li>
                                    </ul>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>Quick Actions</Card.Title>
                                <div className="d-grid gap-2">
                                    <Button variant="outline-primary" href={route('profile.edit')}>
                                        Edit Profile
                                    </Button>
                                    <Button variant="outline-success">Add New Student</Button>
                                    <Button variant="outline-info">Create Program</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
}
