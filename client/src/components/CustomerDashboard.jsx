import React, { useState, useEffect } from 'react';

// --- DUMMY DATA (Can be moved to data.js later) ---
const mockData = {
    user: { name: 'Jeeva' },
    allItems: [
        { id: 1, name: 'Sunrise Citrus Bowl', price: 220, image: 'https://images.unsplash.com/photo-1577234286637-4211713a3a69?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', category: 'Fruit Bowls' },
        { id: 3, name: 'Berry Blast Bowl', price: 180, image: 'https://images.unsplash.com/photo-1590342321329-092a1112a5b7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', category: 'Fruit Bowls' },
        { id: 2, name: 'Avocado Green Smoothie', price: 190, image: 'https://images.unsplash.com/photo-1625937326925-385050a35888?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', category: 'Smoothies' },
        { id: 4, name: 'Mango Lassi', price: 150, image: 'https://images.unsplash.com/photo-1622222033333-c379342e4b67?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', category: 'Smoothies' },
        { id: 5, name: 'South Indian Veg Tiffin', price: 250, image: 'https://plus.unsplash.com/premium_photo-1663852297267-3259b7a062e0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', category: 'Tiffins'},
        { id: 6, name: 'Fresh Oranges (1kg)', price: 120, image: 'https://images.unsplash.com/photo-1580052614034-c55d20b6cb78?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600', category: 'Groceries' }
    ],
    offers: [
        { id: 1, title: '50% Off On Smoothies', image: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200' },
    ],
    orderHistory: [
         { id: 'FOT54321', items: 'Berry Blast Bowl', date: '2025-08-22', status: 'Delivered', price: 180 },
         { id: 'FOT54320', items: 'Tropical Fruit Bowl, Avocado Smoothie', date: '2025-08-20', status: 'Delivered', price: 350 },
    ],
    subscriptions: [
        { id: 1, name: 'Weekly Fruit Bowl', status: 'Active', nextDelivery: '2025-08-25' },
        { id: 2, name: 'Monthly Smoothie Pack', status: 'Paused', nextDelivery: 'N/A' },
    ],
    subscriptionPlans: [
        { name: 'Daily', price: '89', duration: '' },
        { name: 'Weekly', price: '666', duration: '' },
        { name: 'Combo Weekly', price: '1111', duration: '' },
        { name: 'Monthly Smoothies', price: '1400', duration: '/month' },
        { name: 'Monthly Fruit Bowl', price: '1999', duration: '/month' },
        { name: 'Combo Monthly', price: '3000', duration: '/month', bestValue: true },
    ],
    faqs: [
        { q: 'How does the subscription work?', a: 'You can subscribe to weekly or monthly plans. We deliver fresh items to your doorstep every morning.' },
        { q: 'Can I customize my fruit bowl?', a: 'Yes, customization options are available on the product page before adding to the cart.' },
    ]
};

// --- Helper Components ---

const AnimatedPage = ({ children, className = '' }) => (
    <div className={`animate-fade-in ${className}`}>{children}</div>
);

const ProductCard = ({ product, onAddToCart }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col p-3 transition-shadow hover:shadow-md">
        <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-xl" onError={(e) => e.target.src='https://placehold.co/200x150/f8fafc/cbd5e1?text=Fresh'}/>
        <div className="flex-1 flex flex-col pt-3">
            <h4 className="font-bold text-gray-800 flex-1 text-sm md:text-base">{product.name}</h4>
            <div className="flex justify-between items-center mt-2">
                <p className="text-gray-800 font-bold">₹{product.price}</p>
                <button onClick={() => onAddToCart(product)} className="text-sm bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 transition-all">
                    ADD
                </button>
            </div>
        </div>
    </div>
);

const CategoryIcon = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className="text-3xl">{icon}</span>
        </div>
        <p className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>{label}</p>
    </button>
);


// --- Page Components ---

const DashboardHomePage = ({ user, onAddToCart }) => {
    const [activeCategory, setActiveCategory] = useState('All Items');
    
    const categories = [ 
        { label: 'All Items', icon: '💖' },
        { label: 'Fruit Bowls', icon: '🥗' },
        { label: 'Smoothies', icon: '🥤' },
        { label: 'Tiffins', icon: '🍱' },
        { label: 'Groceries', icon: '🛒' },
    ];

    const filteredItems = activeCategory === 'All Items' 
        ? mockData.allItems 
        : mockData.allItems.filter(item => item.category === activeCategory);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <AnimatedPage className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{getGreeting()}, {user.name} 👋</h1>
            
            <div className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold">{mockData.offers[0].title}</h2>
                <p className="text-sm mt-1">Use code FRESH50 at checkout.</p>
                <button className="mt-4 bg-white/30 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-white/40">Order Now</button>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Shop by Category</h3>
                <div className="flex gap-2 overflow-x-auto pb-3">
                    {categories.map(cat => (
                        <CategoryIcon 
                            key={cat.label}
                            {...cat}
                            isActive={activeCategory === cat.label}
                            onClick={() => setActiveCategory(cat.label)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{activeCategory}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.slice(0, 5).map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)
                    ) : (
                        <p className="text-center text-gray-500 py-10 col-span-full">Coming soon!</p>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

const MenuPage = ({ onAddToCart }) => {
    const [activeCategory, setActiveCategory] = useState('All Items');
    
    const categories = [
        { label: 'All Items', icon: '💖' },
        { label: 'Fruit Bowls', icon: '🥗' },
        { label: 'Smoothies', icon: '🥤' },
        { label: 'Tiffins', icon: '🍱' },
        { label: 'Groceries', icon: '🛒' },
    ];

    const filteredItems = activeCategory === 'All Items' 
        ? mockData.allItems 
        : mockData.allItems.filter(item => item.category === activeCategory);

    return (
        <AnimatedPage>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Full Menu</h1>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                {categories.map(cat => (
                    <CategoryIcon 
                        key={cat.label}
                        {...cat}
                        isActive={activeCategory === cat.label}
                        onClick={() => setActiveCategory(cat.label)}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)
                ) : (
                    <p className="text-center text-gray-500 py-10 col-span-full">Coming soon!</p>
                )}
            </div>
        </AnimatedPage>
    );
};


const CartPage = ({ cart, onUpdateCart, onCheckout }) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <AnimatedPage>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">My Cart</h1>
            {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-10">Your cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg"/>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => onUpdateCart(item, -1)} className="font-bold w-7 h-7">-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => onUpdateCart(item, 1)} className="font-bold w-7 h-7">+</button>
                            </div>
                        </div>
                    ))}
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                        <button onClick={onCheckout} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-orange-600">Proceed to Checkout</button>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

const OrdersPage = () => (
    <AnimatedPage>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order History</h1>
        <div className="space-y-4">
            {mockData.orderHistory.map(order => (
                 <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm">
                     <div className="flex justify-between items-start">
                         <div>
                            <p className="font-bold">Order #{order.id}</p>
                            <p className="text-sm text-gray-600">{order.items}</p>
                            <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                         </div>
                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{order.status}</span>
                     </div>
                     <div className="flex justify-between items-center mt-4">
                         <span className="font-bold">₹{order.price}</span>
                         <button className="text-sm text-green-600 font-bold">Reorder</button>
                     </div>
                 </div>
            ))}
        </div>
    </AnimatedPage>
);

const SubscriptionsPage = () => (
    <AnimatedPage>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Subscriptions</h1>
        <div className="space-y-4">
            {mockData.subscriptions.map(sub => (
                <div key={sub.id} className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg">{sub.name}</p>
                            <p className={`text-sm font-semibold ${sub.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>{sub.status}</p>
                        </div>
                        <p className="text-xs text-gray-500">Next: {sub.nextDelivery}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 text-sm bg-gray-200 font-semibold py-2 rounded-lg">Pause</button>
                        <button className="flex-1 text-sm bg-gray-200 font-semibold py-2 rounded-lg">Resume</button>
                        <button className="flex-1 text-sm bg-red-100 text-red-600 font-semibold py-2 rounded-lg">Cancel</button>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-12">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Explore Our Subscription Plans</h2>
                <p className="text-gray-600 mt-2">Save more with our subscription plans</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockData.subscriptionPlans.map((plan, i) => (
                    <div key={i} className={`relative rounded-2xl p-8 border-2 transition-all transform hover:-translate-y-2 ${plan.bestValue ? 'border-green-500 bg-green-50 shadow-2xl' : 'bg-white shadow-lg'}`}>
                        {plan.bestValue && <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 right-5 transform rotate-3">Best Value ⭐</span>}
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-4xl font-bold my-4">₹{plan.price}<span className="text-lg font-medium text-gray-500">{plan.duration}</span></p>
                        <button className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.bestValue ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Subscribe Now</button>
                    </div>
                ))}
            </div>
        </div>
    </AnimatedPage>
);


const ProfilePage = ({ user, onNavigate }) => (
    <AnimatedPage>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">{user.name.charAt(0)}</div>
                <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500">jeeva@freshontime.dev</p>
                </div>
            </div>
            <div className="space-y-2 pt-4">
                <button className="w-full text-left p-3 rounded-lg font-semibold flex justify-between items-center hover:bg-gray-100"><span>📍 Saved Addresses</span> <span>&gt;</span></button>
                <button className="w-full text-left p-3 rounded-lg font-semibold flex justify-between items-center hover:bg-gray-100"><span>💳 Payment Options</span> <span>&gt;</span></button>
                <button onClick={() => onNavigate('subscriptions')} className="w-full text-left p-3 rounded-lg font-semibold flex justify-between items-center hover:bg-gray-100"><span>🔄 My Subscriptions</span> <span>&gt;</span></button>
            </div>
        </div>
    </AnimatedPage>
);

const SupportPage = () => {
    const [openFaq, setOpenFaq] = useState(null);
    return (
        <AnimatedPage>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Support</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                <div>
                    <h3 className="font-bold mb-2">Live Chat</h3>
                    <div className="border rounded-lg p-4 h-48 flex items-center justify-center text-gray-400">
                        Chat UI coming soon...
                    </div>
                </div>
                <button className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.89 7.89 0 0 0 13.6 2.326zM7.994 14.521a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                    Chat on WhatsApp
                </button>
                <div>
                    <h3 className="font-bold mb-2">FAQs</h3>
                    <div className="space-y-2">
                        {mockData.faqs.map((faq, index) => (
                            <div key={index} className="border-b">
                                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center text-left p-3 font-semibold">
                                    <span>{faq.q}</span>
                                    <span className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {openFaq === index && <p className="p-3 text-gray-600 text-sm animate-fade-in-down">{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};


// --- Main Customer Portal Component ---

export default function CustomerPortal({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('home');
    const [cart, setCart] = useState([]);

    const handleAddToCart = (product) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            if (existing) {
                return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };
    
    const handleUpdateCart = (product, change) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            if (!existing) return prevCart;
            
            const newQuantity = existing.quantity + change;
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== product.id);
            }
            return prevCart.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item);
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <DashboardHomePage user={user} onAddToCart={handleAddToCart} />;
            case 'menu': return <MenuPage onAddToCart={handleAddToCart} />;
            case 'cart': return <CartPage cart={cart} onUpdateCart={handleUpdateCart} onCheckout={() => alert('Checkout flow placeholder')} />;
            case 'orders': return <OrdersPage />;
            case 'subscriptions': return <SubscriptionsPage />;
            case 'profile': return <ProfilePage user={user} onNavigate={setActiveTab} />;
            case 'support': return <SupportPage />;
            default: return <DashboardHomePage user={user} onAddToCart={handleAddToCart} />;
        }
    };
    
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const HeaderNavButton = ({ tabName, label }) => (
        <button 
            onClick={() => setActiveTab(tabName)} 
            className={`relative font-semibold transition-colors duration-200 ${activeTab === tabName ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
        >
            {label}
            {activeTab === tabName && <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-green-600"></span>}
        </button>
    );

    const MobileNavButton = ({ tabName, icon, label }) => (
        <button onClick={() => setActiveTab(tabName)} className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${activeTab === tabName ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}>
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-20 shadow-sm">
                <div className="p-4 flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-8 w-auto"/>
                        <span className="font-bold text-xl text-gray-800">FreshOnTime</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <HeaderNavButton tabName="home" label="Home" />
                        <HeaderNavButton tabName="menu" label="Menu" />
                        <HeaderNavButton tabName="orders" label="My Orders" />
                        <HeaderNavButton tabName="subscriptions" label="Subscriptions" />
                        <HeaderNavButton tabName="profile" label="Profile" />
                    </nav>

                    <div className="flex items-center gap-4">
                        {cartItemCount > 0 && (
                            <button onClick={() => setActiveTab('cart')} className="relative">
                                <span className="text-2xl">🛒</span>
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            </button>
                        )}
                        <button onClick={onLogout} className="text-sm bg-red-100 text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-200">Logout</button>
                    </div>
                </div>
            </header>

            <main className="p-4 pb-24 max-w-6xl mx-auto">
                {renderContent()}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-upper z-30 md:hidden">
                <div className="flex justify-around items-center max-w-xl mx-auto">
                    <MobileNavButton tabName="home" label="Home" icon={<span>🏠</span>} />
                    <MobileNavButton tabName="menu" label="Menu" icon={<span>🥗</span>} />
                    <MobileNavButton tabName="orders" label="Orders" icon={<span>📜</span>} />
                    <MobileNavButton tabName="subscriptions" label="Subscriptions" icon={<span>🔄</span>} />
                </div>
            </footer>
        </div>
    );
}
