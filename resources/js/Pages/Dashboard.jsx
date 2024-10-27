import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard() {
    // Mock data - replace with real data from your backend
    const [notifications] = useState(2);
    const studentInfo = {
        name: "Sarah Johnson",
        id: "STU2024001",
        status: "Applicant",
        applicationStage: "In Progress",
        term: "Fall 2024",
        deadlineDate: "Nov 15, 2024"
    };

    const applicationProgress = [
        { status: "complete", text: "Personal Information: Complete" },
        { status: "pending", text: "Academic History: In Progress" },
        { status: "action-needed", text: "Documents: Action Needed" },
        { status: "not-started", text: "Program Selection: Not Started" }
    ];

    const recentActivity = [
        { time: "Today 10:30 AM", text: "Document uploaded: Transcript" },
        { time: "Yesterday 2:20 PM", text: "Profile information updated" },
        { time: "Oct 24, 9:15 AM", text: "Started application process" }
    ];

    const messages = [
        {
            sender: "Admissions Office",
            date: "Oct 26",
            message: "Document verification required: Please submit official transcripts",
            unread: true
        },
        {
            sender: "Financial Aid",
            date: "Oct 24",
            message: "Scholarship information update available",
            unread: false
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* User Controls */}
            <div className="bg-gray-200 px-4 py-2 flex justify-end items-center gap-4">
                <span>{studentInfo.name} - ID: {studentInfo.id}</span>
                <a href="#notifications" className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                    {notifications}
                </a>
                <button className="bg-blue-800 text-white px-3 py-1 rounded">Help</button>
            </div>

            {/* Status Banner */}
            <div className="bg-white p-6 m-4 rounded-md shadow">
                <div className="user-status">
                    <h2 className="text-xl font-semibold">Current Status: {studentInfo.status}</h2>
                    <p>Application Stage: {studentInfo.applicationStage}</p>
                    <p>Term: {studentInfo.term}</p>
                </div>
                <div className="bg-amber-50 text-amber-800 border-l-4 border-amber-500 p-4 rounded-md mt-4">
                    Action Required: Complete Application by {studentInfo.deadlineDate}
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 max-w-7xl mx-auto">
                {/* Quick Actions Section */}
                <section className="bg-white rounded-md p-6 shadow">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <a href="#continue-app" className="bg-blue-800 text-white px-6 py-3 rounded-md text-center font-medium">
                            Continue Application
                        </a>
                        <a href="#documents" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md text-center font-medium">
                            Upload Documents
                        </a>
                        <a href="#requirements" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md text-center font-medium">
                            View Requirements
                        </a>
                    </div>

                    <h3 className="font-semibold mb-3">Application Progress</h3>
                    <ul className="space-y-2">
                        {applicationProgress.map((item, index) => (
                            <li key={index} className={`py-2 border-b border-gray-200 ${
                                item.status === 'complete' ? 'text-green-600' :
                                item.status === 'pending' ? 'text-blue-600' :
                                item.status === 'action-needed' ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Recent Activity Section */}
                <section className="bg-white rounded-md p-6 shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <ul className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <li key={index} className="border-b border-gray-200 pb-2">
                                <time className="text-sm text-gray-600">{activity.time}</time>
                                <p>{activity.text}</p>
                            </li>
                        ))}
                    </ul>
                    <a href="#all-activity" className="block text-right text-blue-800 text-sm mt-4">
                        View All Activity →
                    </a>
                </section>

                {/* Messages Section */}
                <section className="bg-white rounded-md p-6 shadow">
                    <h2 className="text-xl font-semibold mb-4">Messages</h2>
                    <ul className="space-y-4">
                        {messages.map((message, index) => (
                            <li key={index} className={`${message.unread ? 'bg-blue-50 p-2 rounded' : ''} border-b border-gray-200 pb-2`}>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{message.sender}</span>
                                    <time>{message.date}</time>
                                </div>
                                <p>{message.message}</p>
                            </li>
                        ))}
                    </ul>
                    <a href="#inbox" className="block text-right text-blue-800 text-sm mt-4">
                        View All Messages →
                    </a>
                </section>

                {/* Quick Links Section */}
                <section className="bg-white rounded-md p-6 shadow">
                    <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-blue-800 border-b-2 border-gray-200 pb-2 mb-3">
                                Application
                            </h3>
                            <ul className="space-y-2">
                                <li><a href="#app-status" className="text-gray-700 hover:text-blue-800">Application Status</a></li>
                                <li><a href="#missing-items" className="text-gray-700 hover:text-blue-800">Missing Items</a></li>
                                <li><a href="#requirements" className="text-gray-700 hover:text-blue-800">Requirements</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-blue-800 border-b-2 border-gray-200 pb-2 mb-3">
                                Resources
                            </h3>
                            <ul className="space-y-2">
                                <li><a href="#guide" className="text-gray-700 hover:text-blue-800">Application Guide</a></li>
                                <li><a href="#faq" className="text-gray-700 hover:text-blue-800">FAQ</a></li>
                                <li><a href="#contact" className="text-gray-700 hover:text-blue-800">Contact Support</a></li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}