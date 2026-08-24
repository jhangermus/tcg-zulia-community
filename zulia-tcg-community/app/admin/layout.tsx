import React from 'react';
import AdminSidebar from '../../components/admin-sidebar';
import AdminHeader from '../../components/admin-header';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1">
                <AdminHeader />
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;