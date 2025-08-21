import React, { useState } from 'react';

// This single file contains all components and logic for the entire landing page experience.

// --- Reusable Page Header (for About/Contact sub-pages) ---
const PageHeader = ({ onBack }) => (
    <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
                <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-10 w-auto" />
                <span className="text-2xl font-bold text-gray-900">FreshOnTime</span>
            </div>
            <button onClick={onBack} className="text-gray-600 hover:text-green-600 font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Home
            </button>
        </div>
    </header>
);

// --- About Page Component ---
const AboutPage = ({ onBack }) => {
    const values = [
        { title: 'Health First', description: 'We prioritize wellness by using only the freshest, natural ingredients in every bowl.' },
        { title: 'Quality Commitment', description: 'Every ingredient is carefully selected to ensure the highest quality and taste.' },
        { title: 'Community Focus', description: 'Building a healthier community, one fresh meal at a time.' },
        { title: 'Excellence', description: 'Striving for excellence in taste, nutrition, and customer service.' },
    ];
    const team = [
        { name: 'Yeshwanth Naidu', role: 'Founder & CEO', img: 'https://placehold.co/150x150/E2E8F0/4A5568?text=YN' },
        { name: 'Venkatesh', role: 'Co-founder & Operations', img: 'https://placehold.co/150x150/E2E8F0/4A5568?text=V' },
        { name: 'Kiran Naik', role: 'Co-founder & Delivery', img: 'https://placehold.co/150x150/E2E8F0/4A5568?text=KN' },
    ];
    const stats = [
        { value: '50+', label: 'Happy Customers' },
        { value: '100%', label: 'Fresh Guarantee' },
        { value: '6', label: 'Unique Bowl Options' },
    ];

    return (
        <div className="bg-gray-50">
            <PageHeader onBack={onBack} />
            <main className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">About Fresh On Time</h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">We believe healthy living starts with fresh food. Learn more about our story, mission, and the passionate team behind your daily fruit bowls.</p>
                    </div>
                    <div className="mt-12 max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
                                <div className="text-gray-600 space-y-4">
                                    <p>Our journey starts with FreshOnTime. "FreshOnTime" was founded with a simple yet powerful idea: to make it easy for everyone to get their daily dose of healthy food.</p>
                                    <p>What started as a simple idea has grown into a community of health-conscious individuals who trust us for their daily nutrition. We are proud to have served over 50 customers in just our first 3 days of operation.</p>
                                </div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800" alt="Bowl of fresh fruits" className="rounded-2xl shadow-md w-full h-auto" />
                        </div>
                    </div>
                    <div className="mt-16 bg-green-600 text-white rounded-2xl p-12 text-center max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p>To deliver daily health and happiness with natural, nutrient-rich food items. We are committed to serving the best quality, healthy food for everyone in our community.</p>
                    </div>
                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Our Values</h2>
                        <p className="mt-2 text-gray-600">The principles that guide everything we do.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 max-w-6xl mx-auto">
                            {values.map(value => (
                                <div key={value.title} className="bg-white p-6 rounded-2xl shadow-md">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Meet Our Team</h2>
                        <p className="mt-2 text-gray-600">The passion that drives us behind FreshOnTime.</p>
                        <div className="flex flex-wrap justify-center gap-8 mt-8">
                            {team.map(member => (
                                <div key={member.name} className="text-center">
                                    <img src={member.img} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg" />
                                    <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                                    <p className="text-gray-500">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-md text-center">
                                <p className="text-4xl font-bold text-green-600">{stat.value}</p>
                                <p className="text-gray-600 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Contact Page Component ---
const ContactPage = ({ onBack }) => (
    <div className="bg-gray-50 min-h-screen">
        <PageHeader onBack={onBack} />
        <main className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Send us a Message</h1>
                    <p className="mt-4 text-lg text-gray-600">Have questions about our fruit bowls or want to customize your order? We'd love to hear from you!</p>
                </div>
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                         <form className="space-y-4">
                            <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" id="name" placeholder="Enter your full name" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                            <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="tel" id="phone" placeholder="Enter your phone number" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" id="email" placeholder="Enter your email address" className="w-full p-3 border border-gray-300 rounded-lg" /></div>
                            <div><label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea id="message" placeholder="Tell us about your inquiry..." rows="4" className="w-full p-3 border border-gray-300 rounded-lg"></textarea></div>
                            <button type="submit" className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">Send Message</button>
                        </form>
                    </div>
                    <div className="space-y-8">
                         <div className="bg-white p-6 rounded-2xl shadow-lg"><h3 className="text-xl font-semibold text-gray-800 mb-3">Phone Numbers</h3><p className="text-gray-600">+91 94935 32772</p></div>
                         <div className="bg-white p-6 rounded-2xl shadow-lg"><h3 className="text-xl font-semibold text-gray-800 mb-3">Service Area</h3><p className="text-gray-600">Local delivery available in Dharmavaram.</p></div>
                         <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg"><h3 className="text-xl font-semibold mb-3">Need Immediate Help?</h3><p>For urgent orders or immediate assistance, call us directly. We're here to help!</p><p className="mt-4 font-bold">📞 7995933899</p></div>
                    </div>
                </div>
            </div>
        </main>
    </div>
);


// --- Main Product Showcase View (HomePage) ---
const HomePage = ({ onAuthClick, onPortalLinkClick, onNavigate }) => {
    const allProducts = {
        "Fruit Bowls": [
            { name: 'Tropical Fruit Medley', price: '12.00', img: 'https://images.unsplash.com/photo-1592528153932-fe79339d693a?q=80&w=400' },
            { name: 'Berry Blast Bowl', price: '14.50', img: 'https://images.unsplash.com/photo-1502741224143-94386384232b?q=80&w=400' },
        ],
        "Smoothies": [
            { name: 'Green Superfood', price: '15.90', img: 'https://images.unsplash.com/photo-1610970881699-44a5c8a0f493?q=80&w=400' },
            { name: 'Strawberry Sunshine', price: '17.80', img: 'https://images.unsplash.com/photo-1505252585461-1b632da50703?q=80&w=400' },
        ],
        "Groceries": [
            { name: 'Fresh Milk', price: '3.00', img: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?q=80&w=400' },
            { name: 'Organic Eggs', price: '5.50', img: 'https://images.unsplash.com/photo-1582722872445-44dc5f2e6c8f?q=80&w=400' },
        ]
    };

    return (
        <div className="bg-gray-50 pb-16 md:pb-0">
            <Header onAuthClick={onAuthClick} onNavigate={onNavigate} />
            <main>
                <HeroSection />
                {Object.entries(allProducts).map(([category, products]) => (
                    <CategoryProducts key={category} category={category} products={products} />
                ))}
            </main>
            <Footer onPortalLinkClick={onPortalLinkClick} onNavigate={onNavigate} />
            <BottomNavBar onAuthClick={onAuthClick} onNavigate={onNavigate} />
        </div>
    );
};

// --- Landing Page Main Component (with internal routing) ---
export default function LandingPage({ onAuthClick, onPortalLinkClick }) {
    const [page, setPage] = useState('home'); // 'home', 'about', 'contact'

    if (page === 'about') {
        return <AboutPage onBack={() => setPage('home')} />;
    }

    if (page === 'contact') {
        return <ContactPage onBack={() => setPage('home')} />;
    }

    // Default to home page
    return <HomePage onAuthClick={onAuthClick} onPortalLinkClick={onPortalLinkClick} onNavigate={setPage} />;
}


// --- Sub-components for HomePage ---

const Header = ({ onAuthClick, onNavigate }) => (
    <header id="home" className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-2">
                    <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-9 w-auto" />
                    <span className="text-xl font-bold text-gray-800">FreshOnTime</span>
                </div>
                <nav className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
                    <button onClick={() => onNavigate('home')} className="hover:text-green-600 transition-colors">Home</button>
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
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg><span className="text-xs">Home</span></button>
        <button onClick={() => onNavigate('about')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-xs">About</span></button>
        <button onClick={() => onNavigate('contact')} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><span className="text-xs">Contact</span></button>
        <button onClick={onAuthClick} className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors w-1/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-xs">Login</span></button>
    </nav>
);

const HeroSection = () => {
    const categories = [
        { name: 'Fruit Bowls', icon: '🥣' }, { name: 'Smoothies', icon: '🥤' },
        { name: 'Groceries', icon: '🥛' }, { name: 'Tiffins', icon: '🍱' },
        { name: 'Fruits', icon: '🍓' }, { name: 'Others', icon: '🍿' }
    ];
    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center text-center p-8" style={{ background: 'url(https://images.unsplash.com/photo-1542365889-983504a71394?q=80&w=2070&auto=format&fit=crop) center center / cover' }}>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-6xl font-bold text-white">Freshness Delivered,</h1>
                        <h2 className="text-4xl md:text-6xl font-bold text-white">On Time.</h2>
                        <button className="mt-6 bg-green-500 text-white font-bold py-2 px-6 rounded-full text-lg hover:bg-green-600 transition-all shadow-lg">Special Offers</button>
                    </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8">
                    {categories.map((cat, index) => (
                        <a key={index} href="#" className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-green-400 transition-all">
                            <span className="text-4xl mb-2">{cat.icon}</span>
                            <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};
const CategoryProducts = ({ category, products }) => (
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">{category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200 hover:shadow-xl transition-shadow">
                        <img src={p.img} alt={p.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                        <h3 className="font-semibold text-gray-800">{p.name}</h3>
                        <p className="text-gray-500">${p.price}</p>
                        <button className="mt-4 w-full bg-green-100 text-green-700 font-bold py-2 rounded-lg hover:bg-green-200 transition-colors">View More</button>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
const Footer = ({ onPortalLinkClick, onNavigate }) => (
    <footer id="footer" className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <div className="space-y-2 text-gray-300">
                    <button onClick={() => onNavigate('about')} className="block w-full text-center hover:text-white">About Us</button>
                    <button onClick={() => onNavigate('contact')} className="block w-full text-center hover:text-white">Contact Us</button>
                    <button onClick={() => onPortalLinkClick('admin')} className="block w-full text-center hover:text-white">Admin Login</button>
                    <button onClick={() => onPortalLinkClick('agent')} className="block w-full text-center hover:text-white">Agent Login</button>
                </div>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                <div className="flex justify-center space-x-4">
                    {/* Social Icons */}
                </div>
            </div>
            <div className="pt-8 border-t border-gray-700 text-gray-400 text-sm">
                <p>Copyright © 2025 FreshOnTime. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
);
