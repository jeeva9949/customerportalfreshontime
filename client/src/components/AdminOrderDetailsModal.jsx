import React, { useMemo } from 'react';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
    const styles = {
        'Delivered': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Processing': 'bg-blue-100 text-blue-800',
        'Shipped': 'bg-purple-100 text-purple-800',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default function AdminOrderDetailsModal({ order, onClose }) {
    const { 
        subtotal, 
        taxes, 
        deliveryFee, 
        grandTotal 
    } = useMemo(() => {
        const subtotal = order.OrderItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
        const taxes = subtotal * 0.05; // 5% tax
        const deliveryFee = 0; // Or calculate based on logic
        const grandTotal = subtotal + taxes + deliveryFee;
        return { subtotal, taxes, deliveryFee, grandTotal };
    }, [order]);

    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Order #{order.id}</h2>
                            <p className="text-sm text-gray-500">Placed on {format(new Date(order.createdAt), 'PPpp')}</p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-2">Customer Details</h3>
                            <p className="text-gray-800 font-medium">{order.Customer?.name}</p>
                            <p className="text-gray-600 text-sm">{order.Customer?.email || 'No email provided'}</p>
                            <p className="text-gray-600 text-sm">{order.Customer?.mobile || 'No mobile provided'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                             <h3 className="font-semibold text-gray-700 mb-2">Shipping To</h3>
                             <p className="text-gray-800 font-medium">{order.shippingInfo?.address || 'N/A'}</p>
                             <p className="text-gray-600 text-sm">{order.shippingInfo?.pincode || ''}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-3">Items Ordered</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {order.OrderItems?.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                    <img 
                                        src={item.Product?.imageUrl || 'https://placehold.co/100x100/f0f0f0/a0a0a0?text=Image'} 
                                        alt={item.Product?.name} 
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{item.Product?.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-gray-800">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Taxes (5%)</span><span className="font-medium">₹{taxes.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Delivery Fee</span><span className="font-medium text-green-600">{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span></div>
                            <hr className="my-2"/>
                            <div className="flex justify-between font-bold text-lg"><span className="text-gray-800">Total Paid</span><span className="text-gray-900">₹{grandTotal.toFixed(2)}</span></div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Close</button>
                        <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Update Status</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
