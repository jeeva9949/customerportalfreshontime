import React from 'react';

// A modern, visually appealing component for an empty cart
const EmptyCart = ({ onGoToMenu }) => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl h-full shadow-sm">
        <span className="text-6xl mb-4">🛒</span>
        <h3 className="text-2xl font-bold text-gray-800">Your cart is empty!</h3>
        <p className="mt-2 text-gray-500 max-w-xs">Add fresh bowls & smoothies to get started!</p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onGoToMenu}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
            >
                Browse Menu
            </button>
        </div>
    </div>
);

// Component for individual items in the cart, matching the new design
const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
    const handleQuantityChange = (amount) => {
        const newQuantity = item.quantity + amount;
        if (newQuantity <= 0) {
            onRemoveItem(item.id);
        } else {
            onUpdateQuantity(item.id, newQuantity);
        }
    };

    const itemPrice = parseFloat(item.price) || 0;

    return (
        <li className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <img 
                src={item.imageUrl || `https://placehold.co/80x80/f0fdf4/4d7c0f?text=${item.name.charAt(0)}`} 
                alt={item.name}
                className="w-20 h-20 rounded-lg flex-shrink-0 object-cover"
            />
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 leading-tight text-base">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category || 'Miscellaneous'}</p>
                <p className="text-base font-bold text-gray-900 mt-1">₹{itemPrice.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
                <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
                <div className="flex items-center bg-gray-100 rounded-lg mt-2">
                    <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1 text-lg font-bold text-gray-700 hover:bg-gray-200 transition-colors rounded-l-lg">-</button>
                    <span className="px-3 py-1 font-semibold text-gray-800 text-sm w-8 text-center">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} className="px-3 py-1 text-lg font-bold text-gray-700 hover:bg-gray-200 transition-colors rounded-r-lg">+</button>
                </div>
            </div>
        </li>
    );
};

// Component for the price summary and checkout actions
const PriceSummary = ({ subtotal, total, onCheckout }) => {
    const deliveryFee = 0; // As per design, it shows "FREE"
    const taxesAndCharges = subtotal * 0.05; // Example 5% tax
    
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
             <div className="flex">
                <input type="text" placeholder="Apply Coupon" className="w-full p-3 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500 placeholder-gray-400" />
                <button className="bg-gray-800 text-white font-semibold px-6 rounded-r-md hover:bg-gray-900 transition-colors">APPLY</button>
            </div>
            <div className="space-y-2 text-gray-600 border-t border-b py-4">
                <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Taxes & Charges</span>
                    <span>₹{taxesAndCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 pt-2">
                <span>Grand Total</span>
                <span>₹{total.toFixed(2)}</span>
            </div>
            {/* FIX: Checkout button now visible on all screen sizes inside this card */}
            <div className="pt-4">
                <button onClick={onCheckout} className="w-full bg-orange-500 text-white font-bold py-4 px-6 rounded-xl text-lg hover:bg-orange-600 transition-all shadow-lg flex justify-between items-center">
                    <span>Proceed to Checkout</span>
                    <span>₹{total.toFixed(2)}</span>
                </button>
            </div>
        </div>
    );
};


// Main Enhanced Cart Page Component
const CartPage = ({
    cartItems = [],
    onUpdateQuantity = () => {},
    onRemoveItem = () => {},
    onCheckout = () => {},
    onGoToMenu = () => {},
    onBack = () => {}
}) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);
    const total = subtotal + (subtotal * 0.05); // Subtotal + 5% tax

    if (!cartItems || cartItems.length === 0) {
        return <EmptyCart onGoToMenu={onGoToMenu} />;
    }

    return (
        // FIX: Removed extra bottom padding as sticky footer is gone
        <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 mr-2 -ml-2 text-gray-600 hover:text-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2">
                    <ul className="space-y-4">
                        {cartItems.map(item => (
                            <CartItem 
                                key={item.id} 
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                    </ul>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <PriceSummary subtotal={subtotal} total={total} onCheckout={onCheckout}/>
                </div>
            </div>
            
            {/* FIX: Sticky Checkout Bar for Mobile has been removed */}
        </div>
    );
};

export default CartPage;

