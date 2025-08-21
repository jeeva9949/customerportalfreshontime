import React, { useState } from 'react';
import { mockData } from './data.js';

const MenuPage = ({ onBack, onAuthClick }) => {
    const [activeCategory, setActiveCategory] = useState(mockData.categories[0]);
    const [cart, setCart] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state

    const handleAddToCart = (item) => {
        if (isLoggedIn) {
            setCart([...cart, item]);
        } else {
            onAuthClick();
        }
    };

    return (
        <div className="bg-white font-sans">
            {/* <header className="bg-white shadow-sm sticky top-0 z-50">
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
            </header> */}

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filter Bar */}
                    <aside className="w-full md:w-1/4">
                        <h2 className="text-2xl font-bold mb-4">Category</h2>
                        <div className="space-y-2">
                            {mockData.categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`w-full text-left p-2 rounded-lg ${activeCategory === category ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Menu Grid */}
                    <section className="w-full md:w-3/4">
                        <h2 className="text-3xl font-bold mb-8">{activeCategory}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {mockData.items[activeCategory].map(item => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 text-left border border-gray-200 hover:shadow-xl transition-shadow flex flex-col">
                                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                                    <h3 className="font-semibold text-gray-800 flex-grow">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="text-gray-800 font-bold">₹{item.price}</p>
                                        <button onClick={() => handleAddToCart(item)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">Add to Cart</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MenuPage;
