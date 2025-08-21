import React from 'react';

// --- Reusable UI Components ---

const Header = ({ user, onAuthClick, onLogout }) => (
    <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
                <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-10 w-auto" />
                <span className="text-2xl font-bold text-gray-800">FreshOnTime</span>
            </div>
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-700 hidden sm:block">Hello, {user.name}!</span>
                    <button onClick={onLogout} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-all">
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={onAuthClick} className="bg-orange-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-orange-600 transition-all shadow-sm">
                    Login / Sign Up
                </button>
            )}
        </nav>
    </header>
);

// --- MODIFIED FOOTER COMPONENT ---
const Footer = ({ onPortalLinkClick }) => (
    <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <div className="flex justify-center space-x-6 mb-4">
                {/* Changed from <a> to <button> and added onClick handlers */}
                <button onClick={() => onPortalLinkClick('admin')} className="hover:text-orange-400 transition-colors">Admin Portal</button>
                <button onClick={() => onPortalLinkClick('agent')} className="hover:text-orange-400 transition-colors">Agent Portal</button>
                <a href="https://www.instagram.com/freshonntime/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Instagram</a>
                <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
            </div>
            <p className="text-gray-400">&copy; 2025 FreshOnTime. All Rights Reserved.</p>
        </div>
    </footer>
);

const ProductCard = ({ name, description, price, imageUrl }) => (
    <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-all">
        <img src={imageUrl} alt={name} className="w-full h-48 object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/f3f4f6/9ca3af?text=Image+Not+Found'; }}/>
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{name}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-orange-500">₹{price}</span>
                <button className="bg-green-500 text-white font-semibold py-2 px-5 rounded-full hover:bg-green-600 transition-all">Add to Cart</button>
            </div>
        </div>
    </div>
);

// --- Page Components ---

const LandingPage = ({ onOrderNow }) => {
    const products = [
        { name: 'Tropical Bliss Bowl', description: 'Mango, Pineapple, Kiwi, Coconut', price: 250, imageUrl: 'https://images.unsplash.com/photo-1592528153932-fe79339d693a?q=80&w=600' },
        { name: 'Berry Blast Bowl', description: 'Strawberry, Blueberry, Raspberry, Granola', price: 280, imageUrl: 'https://images.unsplash.com/photo-1502741224143-94386384232b?q=80&w=600' },
        { name: 'Citrus Zing Bowl', description: 'Orange, Grapefruit, Lemon, Mint', price: 220, imageUrl: 'https://images.unsplash.com/photo-1478144592103-25e218a0c251?q=80&w=600' },
        { name: 'Melon Medley Bowl', description: 'Watermelon, Muskmelon, Honey Dew', price: 200, imageUrl: 'https://images.unsplash.com/photo-1582375191267-4a17c3ce21d9?q=80&w=600' },
        { name: 'Green Goodness Bowl', description: 'Green Grapes, Kiwi, Green Apple, Pear', price: 260, imageUrl: 'https://images.unsplash.com/photo-1516100888259-43bce2a0e7d3?q=80&w=600' },
        { name: 'Pomegranate Power', description: 'Pomegranate, Banana, Chia Seeds', price: 290, imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9724a3634?q=80&w=600' },
    ];

    return (
        <>
            <section className="hero-bg text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">Fresh Fruit Bowls Delivered On Time.</h1>
                    <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-8">Crafted daily with the freshest ingredients, delivered straight to your doorstep.</p>
                    <button onClick={onOrderNow} className="bg-orange-500 text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-orange-600 transition-all shadow-lg transform hover:scale-105">Order Now</button>
                </div>
            </section>
            <section id="products" className="py-16 sm:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-10">Our Signature Bowls</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(p => <ProductCard key={p.name} {...p} />)}
                    </div>
                </div>
            </section>
        </>
    );
};

const CustomerDashboard = () => (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section id="my-orders">
            <h2 className="text-3xl font-bold mb-6">My Recent Orders</h2>
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500">You have no recent orders. Start shopping now!</p>
                <button className="mt-4 bg-orange-500 text-white font-semibold py-2 px-6 rounded-full hover:bg-orange-600 transition-all">Browse Bowls</button>
            </div>
        </section>
    </main>
);

// --- Main Customer Portal Component ---
// --- Pass the new onPortalLinkClick prop down to the Footer ---
export default function CustomerPortal({ user, onAuthClick, onLogout, onPortalLinkClick }) {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header user={user} onAuthClick={onAuthClick} onLogout={onLogout} />
            <main className="flex-grow">
                {user ? <CustomerDashboard user={user} /> : <LandingPage onOrderNow={onAuthClick} />}
            </main>
            <Footer onPortalLinkClick={onPortalLinkClick} />
        </div>
    );
}
