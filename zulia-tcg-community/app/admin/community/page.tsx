import React from 'react';
import CommunityForm from '../../../components/admin/community-form';
import AdminHeader from '../../../components/admin-header';
import AdminSidebar from '../../../components/admin-sidebar';

const CommunityPage = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <AdminHeader title="Community Management" />
                <CommunityForm />
            </div>
        </div>
    );
};

export default CommunityPage;