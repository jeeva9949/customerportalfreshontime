import React, { useState, useEffect } from 'react';
import SubscriptionPage from './SubscriptionPage'; // Import the dedicated SubscriptionPage component

// --- Helper Components ---

const AnimatedPage = ({ children, className = '' }) => (
    <div className={`animate-fade-in ${className}`}>{children}</div>
);

const ProductCard = ({ product, onAddToCart }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col p-3 transition-shadow hover:shadow-md">
        <img src={product.imageUrl || 'https://placehold.co/200x150/f8fafc/cbd5e1?text=Fresh'} alt={product.name} className="w-full h-32 object-cover rounded-xl" />
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

const CategoryIcon = ({ category, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className="text-3xl">{category.icon || '💖'}</span>
        </div>
        <p className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>{category.name}</p>
    </button>
);

// --- New Subscription Checkout Modal ---
const SubscriptionCheckoutModal = ({ plan, user, onConfirm, onClose }) => {
    const [address, setAddress] = useState(user?.address || '');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsFetchingLocation(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data && data.display_name) {
                            setAddress(data.display_name);
                        } else {
                            setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
                        }
                    } catch (error) {
                        alert('Could not convert coordinates to an address. Please enter it manually.');
                        setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
                    } finally {
                        setIsFetchingLocation(false);
                    }
                },
                (error) => {
                    alert('Could not get your location. Please enable location services and try again.');
                    console.error("Geolocation error:", error);
                    setIsFetchingLocation(false);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!address) {
            alert('Please enter a delivery address.');
            return;
        }
        onConfirm(address);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Confirm Subscription</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <h4 className="font-bold text-lg">{plan?.name}</h4>
                        <p className="text-2xl font-bold text-green-600">₹{plan?.price}<span className="text-base font-medium text-gray-500">{plan?.duration}</span></p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md w-full"
                            placeholder="Enter your full delivery address"
                            rows="3"
                            required
                        />
                        <button type="button" onClick={handleUseCurrentLocation} className="mt-2 text-sm text-pink-500 font-semibold hover:underline" disabled={isFetchingLocation}>
                            {isFetchingLocation ? 'Fetching Location...' : '📍 Use My Current Location'}
                        </button>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md w-full"
                        >
                            <option>UPI</option>
                            <option>Card</option>
                            <option>Wallet</option>
                            <option>Cash on Delivery (COD)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors">
                        Confirm & Pay
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Page Components ---

const DashboardHomePage = ({ user, products, categories, onAddToCart }) => {
    const [activeCategory, setActiveCategory] = useState('All Items');
    
    const categoryList = [{ name: 'All Items', icon: '💖' }, ...(categories || []).map(c => ({...c, icon: '🥗'}))];

    const filteredItems = activeCategory === 'All Items' 
        ? products 
        : products.filter(item => item.Category.name === activeCategory);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <AnimatedPage className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{getGreeting()}, {user?.name} 👋</h1>
            
            <div className="bg-gradient-to-r from-green-500 to-teal-400 text-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold">50% Off On Smoothies</h2>
                <p className="text-sm mt-1">Use code FRESH50 at checkout.</p>
                <button className="mt-4 bg-white/30 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-white/40">Order Now</button>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Shop by Category</h3>
                <div className="flex gap-2 overflow-x-auto pb-3">
                    {categoryList.map(cat => (
                        <CategoryIcon 
                            key={cat.name}
                            category={cat}
                            isActive={activeCategory === cat.name}
                            onClick={() => setActiveCategory(cat.name)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{activeCategory}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredItems && filteredItems.length > 0 ? (
                        filteredItems.slice(0, 5).map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)
                    ) : (
                        <p className="text-center text-gray-500 py-10 col-span-full">No items in this category yet.</p>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

const MenuPage = ({ products, categories, onAddToCart }) => {
    const [activeCategory, setActiveCategory] = useState('All Items');
    
    const categoryList = [{ name: 'All Items', icon: '💖' }, ...(categories || []).map(c => ({...c, icon: '🥗'}))];

    const filteredItems = activeCategory === 'All Items' 
        ? products 
        : products.filter(item => item.Category.name === activeCategory);

    return (
        <AnimatedPage>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Full Menu</h1>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                {categoryList.map(cat => (
                    <CategoryIcon 
                        key={cat.name}
                        category={cat}
                        isActive={activeCategory === cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems && filteredItems.length > 0 ? (
                    filteredItems.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)
                ) : (
                    <p className="text-center text-gray-500 py-10 col-span-full">No items in this category yet.</p>
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
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg"/>
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
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button onClick={() => onCheckout(cart)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-orange-600">Proceed to Checkout</button>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};

const OrdersPage = ({ orders }) => (
    <AnimatedPage>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order History</h1>
        <div className="space-y-4">
            {orders && orders.length > 0 ? orders.map(order => (
                 <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm">
                     <div className="flex justify-between items-start">
                         <div>
                            <p className="font-bold">Order #{order.id}</p>
                            <p className="text-sm text-gray-600">{order.OrderItems.map(oi => `${oi.Product.name} (x${oi.quantity})`).join(', ')}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                         </div>
                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{order.status}</span>
                     </div>
                     <div className="flex justify-between items-center mt-4">
                         <span className="font-bold">₹{order.totalAmount}</span>
                         <button className="text-sm text-green-600 font-bold">Reorder</button>
                     </div>
                 </div>
            )) : <p className="text-center text-gray-500 py-10">You have no past orders.</p>}
        </div>
    </AnimatedPage>
);

const ProfilePage = ({ user, onNavigate }) => (
    <AnimatedPage>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl font-bold">{user?.name.charAt(0)}</div>
                <div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
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

// --- Main Customer Portal Component ---

export default function CustomerPortal({ 
    user, onLogout, onCreateOrder, onSubscribe, onUpdateAddress, 
    products, categories, subscriptionPlans, activeSubscriptions, orders,
    // NEW props from App.js
    onPauseSubscription, onResumeSubscription, onCancelSubscription, onRenewSubscription 
}) {
    const [activeTab, setActiveTab] = useState('home');
    const [cart, setCart] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isSubCheckoutOpen, setIsSubCheckoutOpen] = useState(false);

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

    const handleCheckout = (cartItems) => {
        const orderPayload = {
            cartItems: cartItems.map(item => ({ productId: item.id, quantity: item.quantity }))
        };
        onCreateOrder(orderPayload);
        setCart([]); // Clear cart after placing order
        setActiveTab('orders'); // Navigate to orders page
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setIsSubCheckoutOpen(true);
    };

    const handleConfirmSubscription = async (address) => {
        await onUpdateAddress(address);
        await onSubscribe(selectedPlan.id);
        setIsSubCheckoutOpen(false);
        setSelectedPlan(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <DashboardHomePage user={user} products={products} categories={categories} onAddToCart={handleAddToCart} />;
            case 'menu': return <MenuPage products={products} categories={categories} onAddToCart={handleAddToCart} />;
            case 'cart': return <CartPage cart={cart} onUpdateCart={handleUpdateCart} onCheckout={handleCheckout} />;
            case 'orders': return <OrdersPage orders={orders} />;
            case 'subscriptions': 
                return <SubscriptionPage 
                    subscriptionPlans={subscriptionPlans} 
                    activeSubscriptions={activeSubscriptions} 
                    onSelectPlan={handleSelectPlan} 
                    // Pass the new handlers down to the SubscriptionPage
                    onPause={onPauseSubscription}
                    onResume={onResumeSubscription}
                    onCancel={onCancelSubscription}
                    onRenew={onRenewSubscription}
                />;
            case 'profile': return <ProfilePage user={user} onNavigate={setActiveTab} />;
            default: return <DashboardHomePage user={user} products={products} categories={categories} onAddToCart={handleAddToCart} />;
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
            {isSubCheckoutOpen && (
                <SubscriptionCheckoutModal 
                    plan={selectedPlan}
                    user={user}
                    onConfirm={handleConfirmSubscription}
                    onClose={() => setIsSubCheckoutOpen(false)}
                />
            )}
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
