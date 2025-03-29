import React from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
const dashboard = () => {
    return (
        <main className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <DashboardCard title="📅 Task Scheduler" subtitle="5 upcoming tasks" bgColor="bg-blue-100" />
                <DashboardCard title="📖 Digital Notebook" subtitle="12 notes created" bgColor="bg-green-100" />
                <DashboardCard title="👥 Community" subtitle="3 new posts today" bgColor="bg-purple-100" />
            </div>
            <div className="mt-8 bg-white p-5 rounded shadow">
                <h2 className="text-lg font-bold mb-4">Recent Activities</h2>
                <ul className="list-disc list-inside text-gray-600">
                    <li>Completed "Math Homework" task.</li>
                    <li>Added a new note on "Physics - Motion Laws".</li>
                    <li>Participated in "Study Group - Algebra" discussion.</li>
                </ul>
            </div>
        </main>
    );
};

export default dashboard;
