import React from 'react';
import { useState } from 'react';
import AboutPage from './AboutPage.jsx';
import ContactPage from './ContactPage.jsx';
import SubscriptionPage from './SubscriptionPage.jsx';
import MenuPage from './MenuPage.jsx'; // Assuming MenuPage.jsx is in the same directory
import { mockData } from './data.js'; // Assuming data.js is in the same directory

// --- Landing Page Main Component (Acts as a layout and router) ---
export default function LandingPage({ onAuthClick, onPortalLinkClick }) {
    const [page, setPage] = useState('home'); // 'home', 'about', 'contact', 'subscription', 'menu'
    const [activeCategory, setActiveCategory] = useState('All Items');

    const renderPageContent = () => {
        switch (page) {
            case 'about':
                return <AboutPage onBack={() => setPage('home')} />;
            case 'contact':
                return <ContactPage onBack={() => setPage('home')} />;
            case 'subscription':
                return <SubscriptionPage onBack={() => setPage('home')} />;
            case 'menu':
                return <MenuPage onBack={() => setPage('home')} onAuthClick={onAuthClick} />;
            case 'home':
            default:
                return (
                    <>
                        <HeroSection onNavigate={setPage} />
                        <div id="menu-section" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <CategoryBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                            <CategoryProducts 
                                category={activeCategory} 
                                products={activeCategory === 'All Items' ? Object.values(mockData.items).flat() : mockData.items[activeCategory] || []} 
                            />
                        </div>
                        <SubscriptionTeaser onNavigate={setPage} />
                    </>
                );
        }
    };

    return (
        <div className="bg-white pb-16 md:pb-0">
            <Header onAuthClick={onAuthClick} onNavigate={setPage} />
            <main>
                {renderPageContent()}
            </main>
            <Footer onPortalLinkClick={onPortalLinkClick} onNavigate={setPage} onAuthClick={onAuthClick} />
            <BottomNavBar onAuthClick={onAuthClick} onNavigate={setPage} />
        </div>
    );
}


// --- Shared UI Components ---

const Header = ({ onAuthClick, onNavigate }) => (
    <header id="home" className="bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-2">
                    <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-9 w-auto" />
                    <span className="text-xl font-bold text-gray-800">FreshOnTime</span>
                </div>
                <nav className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 transition-colors">Home</button>
                    <button onClick={() => onNavigate('menu')} className="hover:text-green-600 transition-colors">Menu</button>
                    <button onClick={() => onNavigate('subscription')} className="hover:text-green-600 transition-colors">Subscription</button>
                    <button onClick={() => onNavigate('about')} className="hover:text-green-600 transition-colors">About Us</button>
                    <button onClick={() => onNavigate('contact')} className="hover:text-green-600 transition-colors">Contact Us</button>
                </nav>
                <div className="flex items-center space-x-4">
                    <button onClick={onAuthClick} className="bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-900 transition-all hidden sm:block">Profile/Login</button>
                </div>
            </div>
        </div>
    </header>
);

const BottomNavBar = ({ onAuthClick, onNavigate }) => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center py-2 border-t border-gray-200">
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg><span className="text-xs">Home</span></button>
        <button onClick={() => onNavigate('menu')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg><span className="text-xs">Menu</span></button>
        <button onClick={() => onNavigate('subscription')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span className="text-xs">Subscribe</span></button>
        <button onClick={() => onNavigate('about')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-xs">About</span></button>
        <button onClick={onAuthClick} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-xs">Login</span></button>
    </nav>
);

const HeroSection = ({ onNavigate }) => (
    <section className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            <div className="relative rounded-2xl overflow-hidden min-h-[500px] flex items-end p-8" style={{ background: 'url(https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimephoto_s68mfb.jpg) center center / cover' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <div className="relative z-10 text-white max-w-xl">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">Your Daily Dose of Freshness, Delivered.</h1>
                    <p className="mt-4 text-lg text-gray-300">Experience the taste of nature with our handcrafted fruit bowls, made fresh every day.</p>
                    <div className="mt-6 flex flex-wrap gap-4">
                       <button onClick={() => onNavigate('menu')} className="bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-600 transition-all shadow-lg transform hover:scale-105">Order Now</button>
                       <button onClick={() => onNavigate('menu')} className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white/30 transition-all">View Menu</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const CategoryBar = ({ activeCategory, setActiveCategory }) => {
    const categories = [
        { name: 'All Items', icon: '❤️' },
        { name: 'Fruit Bowls', icon: '🥣' }, 
        { name: 'Smoothies', icon: '🥤' },
        { name: 'Groceries', icon: '🥛' }, 
        { name: 'Tiffins', icon: '🍱' },
        { name: 'Fruits', icon: '🍓' }, 
        { name: 'Others', icon: '🍿' }
    ];

    return (
        <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Shop by <span className="text-purple-600">Category</span></h2>
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                {categories.map((cat) => (
                    <button 
                        key={cat.name} 
                        onClick={() => setActiveCategory(cat.name)}
                        className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg transition-all ${activeCategory === cat.name ? 'bg-purple-100' : ''}`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 ${activeCategory === cat.name ? 'bg-purple-200' : 'bg-gray-100'}`}>{cat.icon}</div>
                        <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                        {activeCategory === cat.name && <div className="w-full h-1 bg-purple-500 mt-2 rounded-full"></div>}
                    </button>
                ))}
            </div>
        </div>
    );
};


const SubscriptionTeaser = ({ onNavigate }) => (
    <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">Plans from ₹89/day</h2>
            <p className="text-gray-600 mt-2">Save big with our daily, weekly, and monthly subscriptions.</p>
            <button
                onClick={() => onNavigate('menu')}
                className="mt-6 inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-600 transition-all shadow-lg"
            >
                View Menu
            </button>
        </div>
    </section>
);

const CategoryProducts = ({ category, products }) => (
    <section id={`category-${category.replace(/\s+/g, '-')}`} className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.length > 0 ? products.map((p, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-center border border-gray-200 hover:shadow-md transition-shadow">
                        <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-md mb-3" />
                        <h3 className="font-semibold text-sm text-gray-800 truncate">{p.name}</h3>
                        <p className="text-gray-500 text-sm">₹{p.price}</p>
                        <button className="mt-3 w-full bg-green-500 text-white font-bold py-1 px-2 rounded-md hover:bg-green-600 transition-colors text-sm">ADD</button>
                    </div>
                )) : <p>No items in this category yet.</p>}
            </div>
        </div>
    </section>
);


const Footer = ({ onPortalLinkClick, onNavigate, onAuthClick }) => (
    <footer id="footer" className="bg-gray-800 text-white" style={{backgroundColor: '#2c3e50'}}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                {/* Column 1: Brand Info */}
                <div>
                    <div className="flex items-center justify-center md:justify-start mb-4">
                        <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-10 w-auto" />
                        <span className="text-xl font-bold ml-2">Fresh on Time</span>
                    </div>
                    <p className="text-gray-400">Your New Daily Fruit Habit</p>
                    <p className="text-gray-400">Stay Healthy, Stay with Fresh on Time</p>
                </div>

                {/* Column 2: Contact Us */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center justify-center md:justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>7995933899</span>
                        </li>
                        <li className="flex items-center justify-center md:justify-start">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>9493532772</span>
                        </li>
                        <li className="flex items-center justify-center md:justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>@freshontime</span>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><button onClick={() => onNavigate('menu')} className="hover:text-white transition-colors">Menu</button></li>
                        <li><button onClick={onAuthClick} className="hover:text-white transition-colors">Order Now</button></li>
                        <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button></li>
                        <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button></li>
                        <li><button onClick={() => onPortalLinkClick('admin')} className="hover:text-white transition-colors">Admin Login</button></li>
                        <li><button onClick={() => onPortalLinkClick('agent')} className="hover:text-white transition-colors">Agent Login</button></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
                <p>© 2025 Fresh on Time. All rights reserved. | Delivering fresh, healthy fruit bowls daily.</p>
            </div>
        </div>
    </footer>
);
