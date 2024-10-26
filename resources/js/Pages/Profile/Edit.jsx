import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <UpdatePasswordForm className="max-w-xl" />
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <DeleteUserForm className="max-w-xl" />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    );
}
