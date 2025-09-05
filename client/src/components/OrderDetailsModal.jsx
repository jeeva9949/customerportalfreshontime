import React, { useMemo } from 'react';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
    const styles = {
        'Delivered': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Processing': 'bg-blue-100 text-blue-800',
        'Shipped': 'bg-indigo-100 text-indigo-800',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function OrderDetailsModal({ order, onClose }) {
    const subtotal = useMemo(() => 
        order.OrderItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0),
    [order]);
    
    const tax = subtotal * 0.05; // Assuming a 5% tax rate
    const total = subtotal + tax;

    if (!order) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-scale-in m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500">Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <StatusBadge status={order.status} />
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Shipping Details */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-2">Shipping To:</h3>
                        <div className="text-sm bg-gray-50 p-3 rounded-lg">
                            <p className="font-bold text-gray-800">{order.Customer?.name}</p>
                            <p className="text-gray-600">123 FreshOnTime Street, Anantapur, AP 515001</p>
                            <p className="text-gray-600">999-888-7777</p>
                        </div>
                    </div>
                    
                    {/* Cart Items */}
                    <div className="mb-6">
                         <h3 className="font-semibold text-gray-700 mb-2">Items Ordered:</h3>
                         <div className="space-y-3">
                            {order.OrderItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                     <img src={item.Product.imageUrl} alt={item.Product.name} className="w-16 h-16 object-cover rounded-lg"/>
                                     <div className="flex-1">
                                         <p className="font-semibold text-gray-800">{item.Product.name}</p>
                                         <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                     </div>
                                     <p className="font-semibold text-gray-800">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Price Summary */}
                    <div className="space-y-2 text-sm border-t pt-4">
                         <div className="flex justify-between text-gray-600"><p>Subtotal</p><p>₹{subtotal.toFixed(2)}</p></div>
                         <div className="flex justify-between text-gray-600"><p>Taxes (5%)</p><p>₹{tax.toFixed(2)}</p></div>
                         <div className="flex justify-between font-bold text-base text-gray-800 border-t pt-2 mt-2"><p>Total Paid</p><p>₹{total.toFixed(2)}</p></div>
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">
                        Close
                    </button>
                    <button className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                        Reorder
                    </button>
                </div>
            </div>
        </div>
    )
};
