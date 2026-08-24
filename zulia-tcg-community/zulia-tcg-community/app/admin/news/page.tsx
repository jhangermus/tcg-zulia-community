import React from 'react';
import NewsForm from '../../../components/admin/news-form';
import AdminHeader from '../../../components/admin-header';
import AdminSidebar from '../../../components/admin-sidebar';

const NewsPage = () => {
    return (
        <div className="admin-container">
            <AdminHeader />
            <div className="admin-content">
                <AdminSidebar />
                <main className="main-content">
                    <h1>Manage News</h1>
                    <NewsForm />
                </main>
            </div>
        </div>
    );
};

export default NewsPage;