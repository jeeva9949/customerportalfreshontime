import React, { useState, useMemo } from 'react';

// --- Stepper Component ---
const CheckoutStepper = ({ currentStep }) => {
    const steps = ['Shipping', 'Confirm Order', 'Payment'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 border-2 ${
                                    isCompleted
                                        ? 'bg-green-500 text-white border-green-500'
                                        : isActive
                                        ? 'bg-green-100 text-green-600 border-green-500'
                                        : 'bg-gray-200 text-gray-400 border-gray-200'
                                }`}
                            >
                                {isCompleted ? '✓' : stepNumber === 1 ? '🚚' : stepNumber === 2 ? '✅' : '💳'}
                            </div>
                            <p className={`mt-2 text-xs sm:text-sm font-semibold w-20 ${isActive || isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-2 sm:mx-4 transition-all duration-500 ${
                                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


// --- Shipping Details Component ---
const ShippingDetails = ({ onNext, user }) => {
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [selectedAddressId, setSelectedAddressId] = useState(addresses.length > 0 ? addresses[0].id : null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const handleAddAddress = () => {
        if (newAddress.trim()) {
            const newAddressObj = { id: Date.now(), type: 'Other', value: newAddress };
            const updatedAddresses = [...addresses, newAddressObj];
            setAddresses(updatedAddresses);
            setSelectedAddressId(newAddressObj.id);
            setNewAddress('');
            setIsAddingAddress(false);
            // Here you would also call a function passed via props to save this address to the backend for the user
        }
    };
    
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
                            setNewAddress(data.display_name);
                        } else {
                            alert('Could not find an address for your location. Please enter it manually.');
                        }
                    } catch (error) {
                        alert('Error fetching address. Please try again.');
                    } finally {
                        setIsFetchingLocation(false);
                    }
                },
                (error) => {
                    alert('Unable to retrieve your location. Please check your browser permissions.');
                    setIsFetchingLocation(false);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleContinue = () => {
        const selectedAddressObject = addresses.find(addr => addr.id === selectedAddressId);
        onNext(selectedAddressObject);
    };

    return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Details</h2>
        
        {addresses.length === 0 && !isAddingAddress && (
             <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">You have no saved addresses.</p>
             </div>
        )}

        <div className="space-y-4">
            {addresses.map(address => (
                <div key={address.id} onClick={() => setSelectedAddressId(address.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-300'}`}>
                    <label className="flex items-center">
                        <input type="radio" name="address" checked={selectedAddressId === address.id} readOnly className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"/>
                        <div className="ml-3">
                            <p className="font-semibold text-gray-800">{address.type}</p>
                            <p className="text-sm text-gray-600">{address.value}</p>
                        </div>
                    </label>
                </div>
            ))}
        </div>

        {isAddingAddress ? (
            <div className="mt-6 space-y-3 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">Add a new address</h3>
                <textarea 
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="E.g. 123 FreshOnTime Street, Anantapur..."
                    rows="3"
                />
                <button onClick={handleUseCurrentLocation} className="text-sm text-pink-500 font-semibold hover:underline flex items-center gap-2" disabled={isFetchingLocation}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {isFetchingLocation ? 'Fetching Location...' : 'Use My Current Location'}
                </button>
                <div className="flex gap-2 pt-2">
                    <button onClick={handleAddAddress} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600">Save Address</button>
                    <button onClick={() => setIsAddingAddress(false)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
            </div>
        ) : (
            <button onClick={() => setIsAddingAddress(true)} className="w-full mt-6 text-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors">
                + Add New Address
            </button>
        )}

        <button onClick={handleContinue} className="w-full bg-orange-500 text-white font-bold py-3 mt-8 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300" disabled={!selectedAddressId}>
            Continue
        </button>
    </div>
)};

// --- Order Confirmation Component ---
const OrderConfirmationDetails = ({ onBack, onNext, cartItems, user, address }) => {
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0), [cartItems]);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Order</h2>
            
            {/* Shipping Details */}
            <div className="mb-6 pb-4 border-b">
                <h3 className="font-semibold mb-2">Shipping To:</h3>
                <p className="font-bold">{user?.name}</p>
                <p className="text-sm text-gray-600">{address ? address.value : 'No address selected.'}</p>
                <p className="text-sm text-gray-600">{user?.mobile || 'Please add a mobile number.'}</p>
            </div>
            
            {/* Cart Items */}
            <div className="mb-6">
                 <h3 className="font-semibold mb-2">Items:</h3>
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                             <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg"/>
                             <div className="flex-1">
                                 <p className="font-semibold">{item.name}</p>
                                 <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                             </div>
                             <p className="font-semibold">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 text-sm border-t pt-4">
                 <div className="flex justify-between"><p>Subtotal</p><p>₹{subtotal.toFixed(2)}</p></div>
                 <div className="flex justify-between"><p>Taxes (5%)</p><p>₹{tax.toFixed(2)}</p></div>
                 <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><p>Total</p><p>₹{total.toFixed(2)}</p></div>
            </div>

            <div className="flex gap-4 mt-8">
                <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">
                    Back
                </button>
                <button onClick={onNext} className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
                    Proceed to Payment
                </button>
            </div>
        </div>
    )
};


// --- Payment Details Component ---
const PaymentDetails = ({ onBack, onConfirm }) => (
     <div className="bg-white p-8 rounded-xl shadow-md animate-fade-in">
        <h2 className="text-2xl font-bold text-center mb-6">Payment Method</h2>
        <div className="space-y-4">
            {/* Payment options can be listed here */}
            <div className="p-4 border rounded-lg text-center">
                <p>Implement payment options here (e.g., Stripe, Razorpay).</p>
            </div>
            <div className="flex gap-4 mt-6">
                <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">
                    Back
                </button>
                <button onClick={onConfirm} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Confirm Order
                </button>
            </div>
        </div>
    </div>
);

// --- Order Placed Confirmation Component ---
const OrderPlacedConfirmation = ({ onGoHome }) => (
    <div className="bg-white p-8 rounded-xl shadow-md text-center animate-fade-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mt-4 text-gray-800">Order Placed Successfully!</h2>
        <p className="text-gray-600 mt-2">Thank you for your purchase. You can track your order in the "My Orders" section.</p>
        <button onClick={onGoHome} className="mt-8 bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 transition-colors">
            Back to Home
        </button>
    </div>
);


// --- Main Checkout Page Component ---
export default function CheckoutPage({ cartItems, onPlaceOrder, onBackToCart, onGoHome, user }) {
    const [step, setStep] = useState(1); // 1: Shipping, 2: Confirm, 3: Payment, 4: Success
    const [shippingInfo, setShippingInfo] = useState({ address: null });

    const handleShippingNext = (selectedAddress) => {
        setShippingInfo({ address: selectedAddress });
        setStep(2);
    };

    const handleBack = () => setStep(s => s - 1);
    
    const handleConfirmOrder = () => {
        onPlaceOrder(cartItems, shippingInfo);
        setStep(4); // Move to success page
    };
    
    const handlePaymentNext = () => {
        // In a real app, this would be after successful payment
        handleConfirmOrder();
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return <ShippingDetails onNext={handleShippingNext} user={user} />;
            case 2:
                return <OrderConfirmationDetails onBack={handleBack} onNext={() => setStep(3)} cartItems={cartItems} user={user} address={shippingInfo.address} />;
            case 3:
                return <PaymentDetails onBack={handleBack} onConfirm={handlePaymentNext} />;
            case 4:
                return <OrderPlacedConfirmation onGoHome={onGoHome} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                {step < 4 && <button onClick={onBackToCart} className="text-gray-600 hover:text-gray-900 font-semibold mb-6">&larr; Back to Cart</button>}
                {step < 4 && <CheckoutStepper currentStep={step} />}
                {renderStepContent()}
            </div>
        </div>
    );
}

