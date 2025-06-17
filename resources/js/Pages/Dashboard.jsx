import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// A reusable card component for the dashboard grid
const DashboardCard = ({ title, children, className = '' }) => (
    <section className={`bg-white rounded-md p-6 shadow ${className}`}>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
    </section>
);

// A component for displaying a single status item
const StatusItem = ({ text, status }) => {
    const statusClasses = {
        complete: 'text-green-600',
        pending: 'text-blue-600',
        'action-needed': 'text-red-600',
        'not-started': 'text-gray-600',
    };
    return (
        <li className={`py-2 border-b border-gray-200 ${statusClasses[status] || 'text-gray-600'}`}>
            {text}
        </li>
    );
};

export default function Dashboard({ auth }) {
    // State to hold dynamic data fetched from the backend
    const [studentInfo, setStudentInfo] = useState(null);
    const [applicationProgress, setApplicationProgress] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // This effect runs when the component mounts to fetch dashboard data.
        // In a real application, you would make an API call to your backend here.
        // For now, we will simulate this by using the authenticated user data
        // and some example dynamic data.

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // In a real scenario, you'd fetch this data from an API endpoint
                // e.g., const response = await axios.get('/api/v1/dashboard-data');
                // const data = response.data;
                
                // For demonstration, we'll use the user from Inertia's `auth` prop
                // and create some sample data.
                const user = auth.user;
                
                // You would typically fetch student-specific info from your backend
                // based on the logged-in user's ID.
                setStudentInfo({
                    name: user.name,
                    id: user.id, // Or a student-specific ID
                    status: 'Applicant', // This would come from your backend
                    applicationStage: 'In Progress',
                    term: 'Fall 2024',
                    deadlineDate: 'Dec 1, 2024',
                });
                
                // This data would also come from your backend
                setApplicationProgress([
                    { status: 'complete', text: 'Personal Information: Complete' },
                    { status: 'pending', text: 'Academic History: In Progress' },
                    { status: 'action-needed', text: 'Documents: Action Needed' },
                ]);

                setRecentActivity([
                    { time: "Today 11:00 AM", text: "Logged in successfully." },
                    { time: "Yesterday 4:00 PM", text: "Viewed program requirements." },
                ]);
                
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load dashboard information. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [auth.user]); // Re-run effect if the user changes

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {loading && <p>Loading dashboard...</p>}
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error}</div>}
                    
                    {!loading && !error && studentInfo && (
                        <>
                            {/* Status Banner */}
                            <div className="bg-white p-6 mb-8 rounded-md shadow">
                                <h2 className="text-2xl font-semibold">Welcome, {studentInfo.name}!</h2>
                                <p className="text-gray-600">Current Status: {studentInfo.status} | Application Stage: {studentInfo.applicationStage}</p>
                                <div className="mt-4 bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded-md">
                                    Action Required: Complete Application by {studentInfo.deadlineDate}
                                </div>
                            </div>

                            {/* Main Dashboard Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DashboardCard title="Quick Actions">
                                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                        <a href="#continue" className="bg-blue-600 text-white px-6 py-3 rounded-md text-center font-medium hover:bg-blue-700">
                                            Continue Application
                                        </a>
                                        <a href="#upload" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md text-center font-medium hover:bg-gray-300">
                                            Upload Documents
                                        </a>
                                    </div>
                                    <h3 className="font-semibold mb-3 text-gray-700">Application Progress</h3>
                                    <ul className="space-y-2">
                                        {applicationProgress.map((item, index) => (
                                            <StatusItem key={index} {...item} />
                                        ))}
                                    </ul>
                                </DashboardCard>
                                
                                <DashboardCard title="Recent Activity">
                                    <ul className="space-y-4">
                                        {recentActivity.map((activity, index) => (
                                            <li key={index} className="border-b border-gray-200 pb-2">
                                                <time className="text-sm text-gray-500">{activity.time}</time>
                                                <p className="text-gray-800">{activity.text}</p>
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="#all-activity" className="block text-right text-blue-600 hover:underline text-sm mt-4">
                                        View All Activity →
                                    </a>
                                </DashboardCard>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}