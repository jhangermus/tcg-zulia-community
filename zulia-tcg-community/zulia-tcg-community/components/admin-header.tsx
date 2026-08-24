import React from 'react';

const AdminHeader = () => {
    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Zulia TCG Admin Panel</h1>
            <div className="flex items-center">
                <span className="mr-4">Admin</span>
                <button className="bg-yellow-500 text-black px-4 py-2 rounded">Logout</button>
            </div>
        </header>
    );
};

export default AdminHeader;