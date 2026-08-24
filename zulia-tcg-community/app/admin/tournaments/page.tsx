import React from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import AdminHeader from '../../../components/admin-header';
import TournamentForm from '../../../components/admin/tournament-form';

const TournamentsPage = () => {
    return (
        <div className="admin-container">
            <AdminSidebar />
            <div className="admin-content">
                <AdminHeader title="Manage Tournaments" />
                <TournamentForm />
            </div>
        </div>
    );
};

export default TournamentsPage;