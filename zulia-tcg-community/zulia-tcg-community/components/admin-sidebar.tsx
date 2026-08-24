import React from 'react';
import Link from 'next/link';

const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <div className="logo">
                <h2>Zulia TCG Admin</h2>
            </div>
            <nav>
                <ul>
                    <li>
                        <Link href="/admin/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link href="/admin/tournaments">Tournaments</Link>
                    </li>
                    <li>
                        <Link href="/admin/decks">Decks</Link>
                    </li>
                    <li>
                        <Link href="/admin/news">News</Link>
                    </li>
                    <li>
                        <Link href="/admin/store">Store</Link>
                    </li>
                    <li>
                        <Link href="/admin/community">Community</Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar;