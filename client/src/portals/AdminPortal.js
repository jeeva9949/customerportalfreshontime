import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Child Components for Admin Dashboard ---
import DashboardOverview from '../components/Dashboard';
import CustomerManagement from '../components/CustomerManagement';
import LiveAgentTrackerPage from '../components/LiveAgentTracker';
import SubscriptionManagementAdminView from '../components/SubscriptionManagementAdminView';
import AdminOrderDetailsModal from '../components/AdminOrderDetailsModal'; // Import the new modal


// --- Re-usable components ---
const StatusPill = ({ status }) => {
    const statusClasses = {
        Pending: 'bg-yellow-100 text-yellow-800', 'In Transit': 'bg-blue-100 text-blue-800',
        Delivered: 'bg-green-100 text-green-800', Failed: 'bg-red-100 text-red-800',
        Cancelled: 'bg-red-100 text-red-800', Open: 'bg-blue-100 text-blue-800',
        Approved: 'bg-green-100 text-green-800', Resolved: 'bg-green-100 text-green-800',
        Paid: 'bg-green-100 text-green-800', Unpaid: 'bg-red-100 text-red-800',
        Due: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status || 'N/A'}</span>;
};

const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full text-left p-4 text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{label}</button>
);

const SearchBar = ({ onSearch, placeholder }) => (
    <input type="text" onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="p-2 border border-gray-300 rounded-lg w-full md:w-auto flex-grow bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
);

const ReportsAndExport = ({ deliveries, payments, agents }) => {
    const [reportType, setReportType] = useState('deliveries');
    const [filters, setFilters] = useState({ startDate: '', endDate: '', agentId: 'all', status: 'all' });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredData = useMemo(() => {
        let data = reportType === 'deliveries' ? deliveries : payments;
        if (!data) return [];
        if (filters.startDate) data = data.filter(item => new Date(item.delivery_date || item.due_date) >= new Date(filters.startDate));
        if (filters.endDate) data = data.filter(item => new Date(item.delivery_date || item.due_date) <= new Date(filters.endDate));
        if (filters.agentId !== 'all') data = data.filter(item => item.agent_id === parseInt(filters.agentId));
        if (filters.status !== 'all') data = data.filter(item => item.status === filters.status);
        return data;
    }, [reportType, deliveries, payments, filters]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 14, 16);
        autoTable(doc, {
            head: [['Date', 'Customer', 'Agent', 'Status', 'Amount']],
            body: filteredData.map(item => [
                format(new Date(item.delivery_date || item.due_date), 'yyyy-MM-dd'),
                item.customer?.name || 'N/A',
                item.agent?.name || 'N/A',
                item.status,
                item.amount ? `₹${item.amount}` : 'N/A'
            ]),
            startY: 20
        });
        doc.save(`${reportType}_report.pdf`);
    };

    const getCsvData = () => filteredData.map(item => ({
        Date: format(new Date(item.delivery_date || item.due_date), 'yyyy-MM-dd'),
        Customer: item.customer?.name || 'N/A',
        Agent: item.agent?.name || 'N/A',
        Status: item.status,
        Amount: item.amount || 'N/A',
    }));

    return (
        <div className="space-y-6">
            <div className="p-4 bg-white rounded-lg border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full"><option value="deliveries">Deliveries</option><option value="payments">Payments</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Date From</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Date To</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Agent</label><select name="agentId" value={filters.agentId} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"><option value="all">All Agents</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"><option value="all">All</option><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Failed</option></select></div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <CSVLink data={getCsvData()} filename={`${reportType}_report.csv`} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Export CSV</CSVLink>
                <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Export PDF</button>
            </div>
            
            <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            {reportType === 'payments' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.length > 0 ? filteredData.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(item.delivery_date || item.due_date), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.customer?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.agent?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={item.status} /></td>
                                {reportType === 'payments' && <td className="px-6 py-4 whitespace-nowrap">₹{item.amount}</td>}
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-500">No data found for the selected filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Admin Dashboard Component ---
export default function AdminPortal({ 
    onLogout, 
    allCustomers: customers = [], 
    allAgents: agents = [], 
    allDeliveries: deliveries = [], 
    allPayments: payments = [], 
    allSupportTickets: supportTickets = [], 
    allPasswordRequests: passwordRequests = [],
    allProducts: products = [], 
    allCategories: categories = [], 
    allOrders = [], 
    allSubscriptionPlans: subscriptionPlans = [],
    allSubscriptions = [],
    onCreate, 
    onUpdate, 
    onDelete,
    onAdminSubscriptionAction,
    ModalComponent
}) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formState, setFormState] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSubscription, setCustomerSubscription] = useState(null);
    const [isLoadingSub, setIsLoadingSub] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); // --- NEW: State for selected order ---

    const openModal = useCallback((type, item = null) => {
        setModalType(type);
        setFormState(item || {});
        setIsModalOpen(true);
    }, []);

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedCustomer(null);
    };

    useEffect(() => {
        if (selectedCustomer && allSubscriptions.length > 0) {
            const sub = allSubscriptions.find(s => s.customerId === selectedCustomer.id);
            setCustomerSubscription(sub || null);
        } else {
            setCustomerSubscription(null);
        }
    }, [selectedCustomer, allSubscriptions]);
  
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        const resourceMap = {
            'addCustomer': 'customers', 'editCustomer': 'customers',
            'addAgent': 'agents', 'editAgent': 'agents',
            'createDelivery': 'deliveries', 'editDelivery': 'deliveries',
            'addPayment': 'payments', 'editPayment': 'payments',
            'addProduct': 'products', 'editProduct': 'products',
            'addCategory': 'products/categories',
            'addSubscriptionPlan': 'subscriptions/plans', 'editSubscriptionPlan': 'subscriptions/plans'
        };
        const resource = resourceMap[modalType];
        
        if (formState.id) {
            onUpdate(resource, formState.id, formState);
        } else {
            onCreate(resource, formState);
        }
        setIsModalOpen(false);
    };
    
    const handleApprovePassword = (requestId) => {
        onUpdate('password-requests', `${requestId}/approve`, {});
    };

    const renderModalContent = () => {
        if (!isModalOpen) return null;
        const inputClass = "p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-500";
        const labelClass = "block text-sm font-medium text-gray-700";
        const buttonClass = "w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700";

        switch (modalType) {
            case 'addCustomer': case 'editCustomer':
                return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Name" className={inputClass} required/><input name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Email" className={inputClass} required/><input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className={inputClass} required/><textarea name="address" value={formState.address || ''} onChange={handleFormChange} placeholder="Address" className={inputClass} required/><div><label className={labelClass}>First Purchase</label><input type="date" name="first_purchase_date" value={formState.first_purchase_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><button type="submit" className={buttonClass}>Save Customer</button></form>);
            case 'addAgent': case 'editAgent':
                 return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Agent Name" className={inputClass} required/><input type="email" name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Login Email" className={inputClass} required/><input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className={inputClass} required/>{modalType === 'addAgent' && <input type="password" name="password" value={formState.password || ''} onChange={handleFormChange} placeholder="Login Password" className={inputClass} required/>}<textarea name="bank_details" value={formState.bank_details || ''} onChange={handleFormChange} placeholder="Bank Details (Account #, IFSC)" className={inputClass}/><div><label className={labelClass}>Joined Date</label><input type="date" name="join_date" value={formState.join_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><div><label className={labelClass}>Salary Status</label><select name="salary_status" value={formState.salary_status || 'Unpaid'} onChange={handleFormChange} className={inputClass}><option>Unpaid</option><option>Paid</option></select></div><button type="submit" className={buttonClass}>Save Agent</button></form>);
            case 'createDelivery': case 'editDelivery':
                return (<form onSubmit={handleSubmit} className="space-y-4"><select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select name="agent_id" value={formState.agent_id || ''} onChange={handleFormChange} className={inputClass}><option value="">Assign Later</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select><input type="date" name="delivery_date" value={formState.delivery_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass} required /><input name="item" value={formState.item || ''} onChange={handleFormChange} placeholder="Item Description" className={inputClass} /><select name="status" value={formState.status || 'Pending'} onChange={handleFormChange} className={inputClass}><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select><div className="flex items-center"><input type="checkbox" id="is_recurring" name="is_recurring" checked={!!formState.is_recurring} onChange={handleFormChange} /><label htmlFor="is_recurring" className="ml-2">Recurring Daily</label></div><button type="submit" className={buttonClass}>Save Delivery</button></form>);
            case 'addPayment': case 'editPayment':
                return (<form onSubmit={handleSubmit} className="space-y-4"><select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="number" name="amount" value={formState.amount || ''} onChange={handleFormChange} placeholder="Amount" className={inputClass} required/><div><label className={labelClass}>Due Date</label><input type="date" name="due_date" value={formState.due_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><select name="status" value={formState.status || 'Due'} onChange={handleFormChange} className={inputClass}><option>Due</option><option>Paid</option><option>Overdue</option></select><button type="submit" className={buttonClass}>Save Payment</button></form>);
            case 'addProduct': case 'editProduct':
                return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Product Name" className={inputClass} required/><textarea name="description" value={formState.description || ''} onChange={handleFormChange} placeholder="Description" className={inputClass} /><input type="number" name="price" value={formState.price || ''} onChange={handleFormChange} placeholder="Price" className={inputClass} required/><input type="number" name="stock" value={formState.stock || ''} onChange={handleFormChange} placeholder="Stock" className={inputClass} required/><select name="categoryId" value={formState.categoryId || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input name="imageUrl" value={formState.imageUrl || ''} onChange={handleFormChange} placeholder="Image URL" className={inputClass} /><button type="submit" className={buttonClass}>Save Product</button></form>);
            case 'addCategory':
                return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Category Name" className={inputClass} required/><textarea name="description" value={formState.description || ''} onChange={handleFormChange} placeholder="Description" className={inputClass} /><button type="submit" className={buttonClass}>Save Category</button></form>);
            case 'addSubscriptionPlan': case 'editSubscriptionPlan':
                return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Plan Name" className={inputClass} required/><input type="number" name="price" value={formState.price || ''} onChange={handleFormChange} placeholder="Price" className={inputClass} required/><input name="duration" value={formState.duration || ''} onChange={handleFormChange} placeholder="Duration (e.g., /month)" className={inputClass} /><div className="flex items-center"><input type="checkbox" id="bestValue" name="bestValue" checked={!!formState.bestValue} onChange={handleFormChange} /><label htmlFor="bestValue" className="ml-2">Best Value</label></div><button type="submit" className={buttonClass}>Save Plan</button></form>);
            default: return null;
        }
    };

    const CustomerDetailsDrawer = () => {
        if (!selectedCustomer) return null;
        return (
             <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 z-40 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="p-6">
                    <button onClick={closeDrawer} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    <h2 className="text-2xl font-bold mb-6">{selectedCustomer.name}</h2>
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Management</h3>
                        {isLoadingSub ? <p>Loading subscription...</p> : (
                            <SubscriptionManagementAdminView 
                                subscription={customerSubscription}
                                deliveries={deliveries}
                                agents={agents}
                                onPause={() => onAdminSubscriptionAction('pause', customerSubscription.id)}
                                onResume={() => onAdminSubscriptionAction('resume', customerSubscription.id)}
                                onCancel={() => onAdminSubscriptionAction('cancel', customerSubscription.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };
  
    const renderContent = () => {
        const filteredAgents = agents.filter(a =>
            (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.mobile && a.mobile.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview deliveries={deliveries} payments={payments} customers={customers} agents={agents} />;
            case 'customers':
                return <CustomerManagement customers={customers} deliveries={deliveries} payments={payments} onSelectCustomer={handleSelectCustomer} onUpdateCustomer={(c) => openModal('editCustomer', c)} onDeleteCustomer={(id) => onDelete('customers', id)} onAddCustomer={() => openModal('addCustomer')} />;
            case 'live_map':
                return (<div className="h-[70vh] bg-white shadow-lg rounded-xl overflow-hidden"><LiveAgentTrackerPage /></div>);
            case 'products': 
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search products..." /> <div className="flex gap-2 w-full md:w-auto"> <button onClick={() => openModal('addProduct')} className="flex-1 md:flex-none bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">+ Add Product</button> <button onClick={() => openModal('addCategory')} className="flex-1 md:flex-none bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600">+ Add Category</button> </div> </div> <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (<tr key={p.id}><td className="px-6 py-4 whitespace-nowrap">{p.name}</td><td className="px-6 py-4 whitespace-nowrap">{p.Category?.name}</td><td className="px-6 py-4 whitespace-nowrap">₹{p.price}</td><td className="px-6 py-4 whitespace-nowrap">{p.stock}</td><td className="px-6 py-4 whitespace-nowrap"><button onClick={() => openModal('editProduct', p)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button><button onClick={() => onDelete('products', p.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table></div> </div> );
            
            case 'subscriptions': 
                return ( 
                    <div className="space-y-8">
                        <div className="bg-white shadow-lg rounded-xl p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                <h2 className="text-xl font-bold text-gray-800">Subscription Plans</h2>
                                <button onClick={() => openModal('addSubscriptionPlan')} className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 w-full md:w-auto">+ Add Plan</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {subscriptionPlans.map(p => (<tr key={p.id}><td className="px-6 py-4 whitespace-nowrap">{p.name}</td><td className="px-6 py-4 whitespace-nowrap">₹{p.price}</td><td className="px-6 py-4 whitespace-nowrap">{p.duration}</td><td className="px-6 py-4 whitespace-nowrap"><button onClick={() => openModal('editSubscriptionPlan', p)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button><button onClick={() => onDelete('subscriptions/plans', p.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white shadow-lg rounded-xl p-6">
                             <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Subscriptions</h2>
                             <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Delivery</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paused Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumed Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agent</th></tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allSubscriptions.map(s => {
                                            const nextDelivery = deliveries.find(d => d.customer_id === s.customerId && new Date(d.delivery_date) >= new Date());
                                            const agent = nextDelivery ? agents.find(a => a.id === nextDelivery.agent_id) : null;
                                            return (
                                                <tr key={s.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{s.Customer?.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{s.SubscriptionPlan?.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={s.status} /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{s.nextDeliveryDate ? format(new Date(s.nextDeliveryDate), 'MMM dd, yyyy') : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{s.pausedAt ? format(new Date(s.pausedAt), 'MMM dd, yyyy') : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{s.resumedAt ? format(new Date(s.resumedAt), 'MMM dd, yyyy') : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{agent ? agent.name : 'Unassigned'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'deliveries': 
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search deliveries..." /> <button onClick={() => openModal('createDelivery')} className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">+ Create Delivery</button> </div> <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{deliveries.filter(d => (d.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(d => (<tr key={d.id}><td className="px-6 py-4 whitespace-nowrap">{d.customer?.name}</td><td className="px-6 py-4 whitespace-nowrap">{d.agent?.name || 'Unassigned'}</td><td className="px-6 py-4 whitespace-nowrap">{format(new Date(d.delivery_date), 'MMM dd, yyyy')}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={d.status} /></td><td className="px-6 py-4 whitespace-nowrap"><button onClick={() => openModal('editDelivery', d)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button><button onClick={() => onDelete('deliveries', d.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table></div> </div> );
            case 'agents': 
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search by name, email, or mobile..." /> <button onClick={() => openModal('addAgent')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">+ Add Agent</button> </div> <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredAgents.map(a => (<tr key={a.id}><td className="px-6 py-4 whitespace-nowrap">{a.name}</td><td className="px-6 py-4 whitespace-nowrap"><div>{a.email}</div><div>{a.mobile}</div></td><td className="px-6 py-4 whitespace-nowrap">{a.join_date ? format(new Date(a.join_date), 'MMM dd, yyyy') : 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap">{a.bank_details}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={a.salary_status} /></td><td className="px-6 py-4 whitespace-nowrap"><button onClick={() => openModal('editAgent', a)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button><button onClick={() => onDelete('agents', a.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table></div> </div> );
            case 'payments': 
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search payments..." /> <button onClick={() => openModal('addPayment')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">+ Add Payment</button> </div> <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{payments.filter(p => (p.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(p => (<tr key={p.id}><td className="px-6 py-4 whitespace-nowrap">{p.customer?.name}</td><td className="px-6 py-4 whitespace-nowrap">₹{p.amount}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={p.status} /></td><td className="px-6 py-4 whitespace-nowrap">{format(new Date(p.due_date), 'MMM dd, yyyy')}</td><td className="px-6 py-4 whitespace-nowrap"><button onClick={() => openModal('editPayment', p)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button><button onClick={() => onDelete('payments', p.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table></div> </div> );
            case 'support': 
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <SearchBar onSearch={setSearchTerm} placeholder="Search tickets..." /> <div className="overflow-x-auto mt-4"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{supportTickets.map(t => (<tr key={t.id}><td className="px-6 py-4 whitespace-nowrap">{t.agent?.name}</td><td className="px-6 py-4 whitespace-nowrap">{t.issueType}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={t.status} /></td><td className="px-6 py-4 whitespace-nowrap">{format(new Date(t.createdAt), 'MMM dd, yyyy')}</td><td className="px-6 py-4 whitespace-nowrap">{t.status === 'Open' && <button onClick={() => onUpdate('support', t.id, { status: 'Resolved' })} className="text-green-600 hover:text-green-900">Resolve</button>}</td></tr>))}</tbody></table></div> </div> );
            case 'orders':
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <SearchBar onSearch={setSearchTerm} placeholder="Search by customer name or order ID..." /> <div className="overflow-x-auto mt-4"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{allOrders.filter(o => (o.Customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm)).map(o => (<tr key={o.id} onClick={() => setSelectedOrder(o)} className="cursor-pointer hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap">#{o.id}</td><td className="px-6 py-4 whitespace-nowrap">{o.Customer?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.OrderItems?.map(item => `${item.Product?.name || 'N/A'} (x${item.quantity})`).join(', ') || 'No items found'}</td><td className="px-6 py-4 whitespace-nowrap">₹{o.totalAmount}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={o.status} /></td><td className="px-6 py-4 whitespace-nowrap">{format(new Date(o.createdAt), 'MMM dd, yyyy')}</td></tr>))}</tbody></table></div> </div> );
            case 'password_requests':
                return ( <div className="bg-white shadow-lg rounded-xl p-6"> <SearchBar onSearch={setSearchTerm} placeholder="Search by agent name..." /> <div className="overflow-x-auto mt-4"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{passwordRequests.filter(pr => (pr.agent?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(pr => (<tr key={pr.id}><td className="px-6 py-4 whitespace-nowrap">{pr.agent?.name}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={pr.status} /></td><td className="px-6 py-4 whitespace-nowrap">{format(new Date(pr.createdAt), 'MMM dd, yyyy')}</td><td className="px-6 py-4 whitespace-nowrap">{pr.status === 'Pending' && <button onClick={() => handleApprovePassword(pr.id)} className="text-green-600 hover:text-green-900">Approve</button>}</td></tr>))}</tbody></table></div> </div> );
            case 'reports': 
                return <ReportsAndExport deliveries={deliveries} payments={payments} agents={agents} />;
            default: return null;
        }
    };
  
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

        <nav className={`w-64 bg-gray-800 text-white flex flex-col fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
            <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="Logo" className="h-10 w-auto rounded-full"/>
                <h1 className="text-xl font-bold">FreshOnTime</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <TabButton label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsSidebarOpen(false);}} />
                <TabButton label="Orders" isActive={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setIsSidebarOpen(false);}} />
                <TabButton label="Products" isActive={activeTab === 'products'} onClick={() => {setActiveTab('products'); setIsSidebarOpen(false);}} />
                <TabButton label="Subscriptions" isActive={activeTab === 'subscriptions'} onClick={() => {setActiveTab('subscriptions'); setIsSidebarOpen(false);}} />
                <TabButton label="Deliveries" isActive={activeTab === 'deliveries'} onClick={() => {setActiveTab('deliveries'); setIsSidebarOpen(false);}} />
                <TabButton label="Customers" isActive={activeTab === 'customers'} onClick={() => {setActiveTab('customers'); setIsSidebarOpen(false);}} />
                <TabButton label="Agents" isActive={activeTab === 'agents'} onClick={() => {setActiveTab('agents'); setIsSidebarOpen(false);}} />
                <TabButton label="Payments" isActive={activeTab === 'payments'} onClick={() => {setActiveTab('payments'); setIsSidebarOpen(false);}} />
                <TabButton label="Live Map" isActive={activeTab === 'live_map'} onClick={() => {setActiveTab('live_map'); setIsSidebarOpen(false);}} />
                <TabButton label="Support" isActive={activeTab === 'support'} onClick={() => {setActiveTab('support'); setIsSidebarOpen(false);}} />
                <TabButton label="Password Requests" isActive={activeTab === 'password_requests'} onClick={() => {setActiveTab('password_requests'); setIsSidebarOpen(false);}} />
                <TabButton label="Reports" isActive={activeTab === 'reports'} onClick={() => {setActiveTab('reports'); setIsSidebarOpen(false);}} />
            </div>
        </nav>
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</h2>
                </div>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Logout</button>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                {renderContent()}
            </main>
        </div>
        <CustomerDetailsDrawer />
        {isDrawerOpen && <div className="fixed inset-0 bg-black opacity-50 z-30" onClick={closeDrawer}></div>}
        {isModalOpen && <ModalComponent title={`Manage ${modalType.replace('add', '').replace('edit', '').replace('create', '')}`} onClose={() => setIsModalOpen(false)}>{renderModalContent()}</ModalComponent>}
        {selectedOrder && <AdminOrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </div>
    );
}

