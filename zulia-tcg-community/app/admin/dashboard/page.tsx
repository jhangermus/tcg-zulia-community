import React from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import AdminHeader from '../../../components/admin-header';

const DashboardPage = () => {
    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader />
                <main className="p-4">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p>Welcome to the admin dashboard! Here you can manage the community activities and metrics.</p>
                    {/* Additional dashboard components and metrics can be added here */}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;