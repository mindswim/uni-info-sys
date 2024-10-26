import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Form, Button, Alert } from 'react-bootstrap';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <Alert variant="success">{status}</Alert>}

            <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                    />
                    {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <Form.Text className="text-danger">{errors.password}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="remember">
                    <Form.Check
                        type="checkbox"
                        label="Remember me"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-decoration-none">
                            Forgot your password?
                        </Link>
                    )}

                    <Button variant="primary" type="submit" disabled={processing}>
                        Log in
                    </Button>
                </div>
            </Form>
        </GuestLayout>
    );
}
