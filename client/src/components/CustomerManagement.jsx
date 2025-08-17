import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Helper Components & Logic ---

const CustomerTag = ({ tag }) => {
    const tagStyles = {
        VIP: 'bg-yellow-300 text-yellow-900',
        Regular: 'bg-blue-200 text-blue-800',
        New: 'bg-green-200 text-green-800',
        Risky: 'bg-red-200 text-red-800',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tagStyles[tag] || 'bg-gray-200'}`}>{tag}</span>;
};

const InsightCard = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-center">
        <div className="text-2xl mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="font-bold text-lg text-gray-900">{value}</p>
        </div>
    </div>
);

const getCustomerTag = (customer, deliveries, payments) => {
    const totalDeliveries = deliveries.filter(d => d.customer_id === customer.id && d.status === 'Delivered').length;
    const totalRevenue = payments.filter(p => p.customer_id === customer.id && p.status === 'Paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const hasOverdue = payments.some(p => p.customer_id === customer.id && (p.status === 'Overdue' || p.status === 'Due'));

    if (totalRevenue > 1000 || totalDeliveries > 20) return 'VIP';
    if (hasOverdue) return 'Risky';
    if (totalDeliveries >= 6) return 'Regular';
    return 'New';
};

const CustomerProfilePanel = ({ customer, deliveries, payments, onClose, onUpdateCustomer, onDeleteCustomer }) => {
    // FIX: All hooks are now called at the top level, before any conditional returns.
    const [notes, setNotes] = useState(customer.notes || '');

    const customerData = useMemo(() => {
        const customerDeliveries = deliveries.filter(d => d.customer_id === customer.id);
        const customerPayments = payments.filter(p => p.customer_id === customer.id);
        
        const totalRevenue = customerPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const outstandingBalance = customerPayments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        const completedDeliveries = customerDeliveries.filter(d => d.status === 'Delivered').length;
        const avgOrderValue = completedDeliveries > 0 ? totalRevenue / completedDeliveries : 0;

        return {
            tag: getCustomerTag(customer, deliveries, payments),
            deliveries: customerDeliveries,
            payments: customerPayments,
            totalRevenue,
            outstandingBalance,
            completedDeliveries,
            avgOrderValue,
        };
    }, [customer, deliveries, payments]);

    // This early return is now safe because no hooks are called after it.
    if (!customer) return null;

    const handleSaveNotes = () => {
        onUpdateCustomer({ ...customer, notes });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`${customer.name}'s Profile`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Tag: ${customerData.tag}`, 14, 30);
        
        autoTable(doc, {
            startY: 40,
            head: [['Metric', 'Value']],
            body: [
                ['Email', customer.email],
                ['Phone', customer.mobile],
                ['Address', customer.address],
                ['Total Revenue', `$${customerData.totalRevenue.toFixed(2)}`],
                ['Outstanding Balance', `$${customerData.outstandingBalance.toFixed(2)}`],
            ],
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Date', 'Status', 'Item']],
            body: customerData.deliveries.map(d => [format(new Date(d.delivery_date), 'yyyy-MM-dd'), d.status, d.item]),
            didDrawPage: (data) => { doc.text('Delivery History', 14, data.cursor.y - 10); }
        });

        doc.save(`${customer.name}_profile.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <div>
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">{customer.name}</h2>
                                <CustomerTag tag={customerData.tag} />
                            </div>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={handleExportPDF} className="text-gray-600 hover:text-indigo-600 p-2 rounded-full bg-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="12" y2="12"></line><line x1="15" y1="15" x2="12" y2="12"></line></svg>
                           </button>
                           <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl p-1">&times;</button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-grow p-6 overflow-y-auto space-y-8">
                        {/* Insights */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InsightCard title="Total Deliveries" value={customerData.deliveries.length} icon="📦" />
                            <InsightCard title="Avg. Order Value" value={`$${customerData.avgOrderValue.toFixed(2)}`} icon="💰" />
                            <InsightCard title="Completed" value={customerData.completedDeliveries} icon="✅" />
                            <InsightCard title="Outstanding" value={`$${customerData.outstandingBalance.toFixed(2)}`} icon="💳" />
                        </div>

                        {/* Payment History */}
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
                            <div className="overflow-x-auto border rounded-lg max-h-60">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {customerData.payments.map(p => (
                                            <tr key={p.id}><td className="px-4 py-2 text-sm">{format(new Date(p.due_date), 'MMM d, yyyy')}</td><td className="px-4 py-2 text-sm">${parseFloat(p.amount).toFixed(2)}</td><td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Notes Section */}
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Admin Notes</h4>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Add customer preferences or notes..."></textarea>
                            <div className="text-right mt-2">
                                <button onClick={handleSaveNotes} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Save Notes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Customer Management Component ---
export default function CustomerManagement({ customers, deliveries, payments, onUpdateCustomer, onDeleteCustomer, onAddCustomer }) {
    const [filters, setFilters] = useState({ search: '', type: 'all', status: 'all' });
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = customer.name.toLowerCase().includes(searchLower) ||
                                  customer.email.toLowerCase().includes(searchLower) ||
                                  customer.mobile.includes(searchLower);

            const tag = getCustomerTag(customer, deliveries, payments);
            const matchesType = filters.type === 'all' || tag === filters.type;
            
            const matchesStatus = filters.status === 'all' || (filters.status === 'Active' && true);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [customers, deliveries, payments, filters]);

    return (
        <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">
            {selectedCustomer && (
                <CustomerProfilePanel 
                    customer={selectedCustomer} 
                    deliveries={deliveries} 
                    payments={payments}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdateCustomer={onUpdateCustomer}
                    onDeleteCustomer={onDeleteCustomer}
                />
            )}

            <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Customer Management</h2>
                    <button onClick={onAddCustomer} className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700">+ Add Customer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="search" placeholder="Search by name, email, or phone..." onChange={handleFilterChange} className="p-2 border rounded-lg w-full" />
                    <select name="type" onChange={handleFilterChange} className="p-2 border rounded-lg w-full">
                        <option value="all">All Types</option>
                        <option value="New">New</option>
                        <option value="Regular">Regular</option>
                        <option value="VIP">VIP</option>
                        <option value="Risky">Risky</option>
                    </select>
                     <select name="status" onChange={handleFilterChange} className="p-2 border rounded-lg w-full">
                        <option value="all">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><CustomerTag tag={getCustomerTag(c, deliveries, payments)} /></td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
