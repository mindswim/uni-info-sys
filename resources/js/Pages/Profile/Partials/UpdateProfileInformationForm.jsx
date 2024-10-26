import { Link, useForm, usePage } from '@inertiajs/react';
import { Form, Button, Alert } from 'react-bootstrap';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <Form onSubmit={submit} className="mt-6 space-y-6">
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="name">Name</Form.Label>
                    <Form.Control
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <Form.Text className="text-danger">{errors.name}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="email">Email</Form.Label>
                    <Form.Control
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                </Form.Group>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <Alert variant="warning">
                        Your email address is unverified.
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="btn btn-link p-0 m-0 align-baseline"
                        >
                            Click here to re-send the verification email.
                        </Link>
                    </Alert>
                )}

                <div className="d-flex align-items-center gap-4">
                    <Button type="submit" disabled={processing}>Save</Button>

                    {recentlySuccessful && (
                        <p className="text-sm text-gray-600">Saved.</p>
                    )}
                </div>
            </Form>
        </section>
    );
}
