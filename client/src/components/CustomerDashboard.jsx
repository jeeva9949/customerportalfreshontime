import React from 'react';

// This component is now only for LOGGED-IN customers.

const Header = ({ user, onLogout }) => (
    <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
                <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-10 w-auto" />
                <span className="text-xl font-semibold text-gray-700">Hello, {user.name}!</span>
            </div>
            <button onClick={onLogout} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-all">
                Logout
            </button>
        </nav>
    </header>
);

const Footer = () => (
     <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400 text-sm">
             <p>Copyright © 2025 FreshOnTime. All Rights Reserved.</p>
        </div>
    </footer>
);


export default function CustomerDashboard({ user, onLogout }) {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header user={user} onLogout={onLogout} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <section id="my-orders">
                    <h2 className="text-3xl font-bold mb-6">My Recent Orders</h2>
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">You have no recent orders. Start shopping now!</p>
                        <button className="mt-4 bg-orange-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-orange-600 transition-all">Browse Menu</button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
