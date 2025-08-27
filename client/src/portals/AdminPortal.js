import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Child Components for Admin Dashboard ---
import DashboardOverview from '../components/Dashboard';
import CustomerManagement from '../components/CustomerManagement';
import LiveAgentTrackerPage from '../components/LiveAgentTracker';
// --- Import the new component ---
import SubscriptionManagementAdminView from '../components/SubscriptionManagementAdminView';


// --- Re-usable components ---
const StatusPill = ({ status }) => {
    const statusClasses = {
        Pending: 'bg-yellow-100 text-yellow-800', 'In Transit': 'bg-blue-100 text-blue-800',
        Delivered: 'bg-green-100 text-green-800', Failed: 'bg-red-100 text-red-800',
        Cancelled: 'bg-red-100 text-red-800', Open: 'bg-blue-100 text-blue-800',
        Approved: 'bg-green-100 text-green-800', Resolved: 'bg-green-100 text-green-800',
        Paid: 'bg-green-100 text-green-800', Unpaid: 'bg-red-100 text-red-800',
        Due: 'bg-yellow-100 text-yellow-800'
    };
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status || 'N/A'}</span>;
};

const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{label}</button>
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
                item.amount ? `$${item.amount}` : 'N/A'
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
        Remarks: ''
    }));

    return (
        <div>
            <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="p-2 border border-gray-300 rounded-md w-full"><option value="deliveries">Deliveries Report</option><option value="payments">Payments Report</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Date From</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Date To</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Agent</label><select name="agentId" value={filters.agentId} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"><option value="all">All Agents</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md w-full"><option value="all">All Statuses</option><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Failed</option></select></div>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-end items-center mb-4">
                    <div className="flex gap-2">
                        <CSVLink data={getCsvData()} filename={`${reportType}_report.csv`} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            Export CSV
                        </CSVLink>
                        <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                           Export PDF
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    {filteredData.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>{reportType === 'payments' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>}</tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">{filteredData.map(item => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(item.delivery_date || item.due_date), 'yyyy-MM-dd')}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.agent?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={item.status} /></td>{reportType === 'payments' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.amount}</td>}</tr>))}</tbody>
                        </table>
                    ) : ( <div className="text-center py-10 text-gray-500">No data found for the selected filters.</div> )}
                </div>
            </div>
        </div>
    );
};

// --- Main Admin Dashboard Component ---
export default function AdminPortal({ 
    onLogout, 
    customers = [], 
    agents = [], 
    deliveries = [], 
    payments = [], 
    supportTickets = [], 
    passwordRequests = [],
    products = [], 
    categories = [], 
    orders = [], 
    subscriptionPlans = [],
    onAddCustomer = () => {}, 
    onUpdateCustomer = () => {}, 
    onDeleteCustomer = () => {}, 
    onAddAgent = () => {}, 
    onUpdateAgent = () => {}, 
    onDeleteAgent = () => {},
    onCreateDelivery = () => {}, 
    onUpdateDelivery = () => {}, 
    onDeleteDelivery = () => {},
    onAddPayment = () => {}, 
    onUpdatePayment = () => {}, 
    onDeletePayment = () => {},
    onResolveTicket = () => {}, 
    onApprovePassword = () => {},
    onAddProduct = () => {}, 
    onUpdateProduct = () => {}, 
    onDeleteProduct = () => {},
    onAddCategory = () => {}, 
    onAddSubscriptionPlan = () => {}, 
    onUpdateSubscriptionPlan = () => {}, 
    ModalComponent,
    // --- NEW Props for Admin Subscription Management ---
    onAdminPauseSubscription,
    onAdminResumeSubscription,
    onAdminCancelSubscription
}) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formState, setFormState] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    // --- NEW state for customer's subscription ---
    const [customerSubscription, setCustomerSubscription] = useState(null);
    const [isLoadingSub, setIsLoadingSub] = useState(false);
  
    const openModal = useCallback((type, item = null) => {
        setModalType(type);
        if (item) { 
            setFormState(item);
        } else {
            const defaultState = {
                addCustomer: { name: '', address: '', mobile: '', email: '' },
                addAgent: { name: '', mobile: '', email: '', password: '', salary_status: 'Unpaid' },
                createDelivery: { customer_id: '', agent_id: '', item: '', status: 'Pending' },
                addPayment: { customer_id: '', amount: '', status: 'Due' },
                addProduct: { name: '', description: '', price: '', stock: '', categoryId: '' },
                addCategory: { name: '', description: '' },
                addSubscriptionPlan: { name: '', price: '', duration: '', bestValue: false }
            };
            setFormState(defaultState[type]);
        }
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

    // --- NEW: Fetch subscription when a customer is selected ---
    useEffect(() => {
        if (selectedCustomer) {
            const fetchSubscription = async () => {
                setIsLoadingSub(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`/api/admin/customers/${selectedCustomer.id}/subscription`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        setCustomerSubscription(await res.json());
                    } else {
                        setCustomerSubscription(null); // No active subscription
                    }
                } catch (error) {
                    console.error("Failed to fetch subscription", error);
                    setCustomerSubscription(null);
                } finally {
                    setIsLoadingSub(false);
                }
            };
            fetchSubscription();
        } else {
            setCustomerSubscription(null);
        }
    }, [selectedCustomer]);
  
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };
  
    const handleSubmit = (e) => {
        e.preventDefault();
        switch (modalType) {
            case 'addCustomer': onAddCustomer(formState); break;
            case 'editCustomer': onUpdateCustomer(formState); break;
            case 'addAgent': onAddAgent(formState); break;
            case 'editAgent': onUpdateAgent(formState); break;
            case 'createDelivery': onCreateDelivery(formState); break;
            case 'editDelivery': onUpdateDelivery(formState); break;
            case 'addPayment': onAddPayment(formState); break;
            case 'editPayment': onUpdatePayment(formState); break;
            case 'addProduct': onAddProduct(formState); break;
            case 'editProduct': onUpdateProduct(formState); break;
            case 'addCategory': onAddCategory(formState); break;
            case 'addSubscriptionPlan': onAddSubscriptionPlan(formState); break;
            case 'editSubscriptionPlan': onUpdateSubscriptionPlan(formState); break;
            default: break;
        }
        setIsModalOpen(false);
    };

    const handleUpdateCustomerClick = useCallback((customer) => openModal('editCustomer', customer), [openModal]);
    const handleUpdateAgentClick = useCallback((agent) => openModal('editAgent', agent), [openModal]);
    const handleUpdateDeliveryClick = useCallback((delivery) => openModal('editDelivery', delivery), [openModal]);
    const handleUpdateProductClick = useCallback((product) => openModal('editProduct', product), [openModal]);
    const handleUpdateSubscriptionPlanClick = useCallback((plan) => openModal('editSubscriptionPlan', plan), [openModal]);

    
    const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);
    const filteredOrders = useMemo(() => orders.filter(o => o.id.toString().includes(searchTerm) || (o.Customer && o.Customer.name.toLowerCase().includes(searchTerm.toLowerCase()))), [orders, searchTerm]);
    const filteredDeliveries = useMemo(() => deliveries.filter(d => (d.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.agent?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [deliveries, searchTerm]);
    const filteredAgents = useMemo(() => agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())), [agents, searchTerm]);
    const filteredPayments = useMemo(() => payments.filter(p => (p.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [payments, searchTerm]);
    const filteredSupportTickets = useMemo(() => supportTickets.filter(t => (t.agent?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [supportTickets, searchTerm]);
    const filteredSubscriptionPlans = useMemo(() => subscriptionPlans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [subscriptionPlans, searchTerm]);

    
    const renderModalContent = () => {
        if (!isModalOpen) return null;
        const inputClass = "p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-500";
        const labelClass = "block text-sm font-medium text-gray-700";
        const buttonClass = "w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm";

        switch (modalType) {
            case 'addCustomer': case 'editCustomer':
                return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Name" className={inputClass} required/><input name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Email" className={inputClass} required/><input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className={inputClass} required/><textarea name="address" value={formState.address || ''} onChange={handleFormChange} placeholder="Address" className={inputClass} required/><div><label className={labelClass}>First Purchase</label><input type="date" name="first_purchase_date" value={formState.first_purchase_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><button type="submit" className={buttonClass}>Save Customer</button></form>);
            case 'addAgent': case 'editAgent':
                 return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Agent Name" className={inputClass} required/><input type="email" name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Login Email" className={inputClass} required/><input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className={inputClass} required/>{modalType === 'addAgent' && <input type="password" name="password" value={formState.password || ''} onChange={handleFormChange} placeholder="Login Password" className={inputClass} required/>}<textarea name="bank_details" value={formState.bank_details || ''} onChange={handleFormChange} placeholder="Bank Details (Account #, IFSC)" className={inputClass}/><div><label className={labelClass}>Joined Date</label><input type="date" name="join_date" value={formState.join_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><div><label className={labelClass}>Salary Status</label><select name="salary_status" value={formState.salary_status || 'Unpaid'} onChange={handleFormChange} className={inputClass}><option>Unpaid</option><option>Paid</option></select></div><button type="submit" className={buttonClass}>Save Agent</button></form>);
            case 'createDelivery': case 'editDelivery':
                return (<form onSubmit={handleSubmit} className="space-y-4"><select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select name="agent_id" value={formState.agent_id || ''} onChange={handleFormChange} className={inputClass}><option value="">Assign Later (Automatic)</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select><input type="date" name="delivery_date" value={formState.delivery_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass} required /><input name="item" value={formState.item || ''} onChange={handleFormChange} placeholder="Item Description" className={inputClass} /><select name="status" value={formState.status || 'Pending'} onChange={handleFormChange} className={inputClass}><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select><div className="flex items-center"><input type="checkbox" id="is_recurring" name="is_recurring" checked={!!formState.is_recurring} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/><label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-900">Recurring Daily Delivery</label></div><button type="submit" className={buttonClass}>Save Delivery</button></form>);
            case 'addPayment': case 'editPayment':
                return (<form onSubmit={handleSubmit} className="space-y-4"><select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="number" name="amount" value={formState.amount || ''} onChange={handleFormChange} placeholder="Amount" className={inputClass} required/><div><label className={labelClass}>Due Date</label><input type="date" name="due_date" value={formState.due_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><select name="status" value={formState.status || 'Due'} onChange={handleFormChange} className={inputClass}><option>Due</option><option>Paid</option><option>Overdue</option></select><button type="submit" className={buttonClass}>Save Payment</button></form>);
            case 'addProduct': case 'editProduct':
                return (<form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Product Name" className={inputClass} required/>
                    <textarea name="description" value={formState.description || ''} onChange={handleFormChange} placeholder="Description" className={inputClass} />
                    <input type="number" name="price" value={formState.price || ''} onChange={handleFormChange} placeholder="Price" className={inputClass} required/>
                    <input type="number" name="stock" value={formState.stock || ''} onChange={handleFormChange} placeholder="Stock Quantity" className={inputClass} required/>
                    <select name="categoryId" value={formState.categoryId || ''} onChange={handleFormChange} className={inputClass} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input name="imageUrl" value={formState.imageUrl || ''} onChange={handleFormChange} placeholder="Image URL" className={inputClass} />
                    <button type="submit" className={buttonClass}>Save Product</button>
                </form>);
            case 'addCategory':
                return (<form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Category Name" className={inputClass} required/>
                    <textarea name="description" value={formState.description || ''} onChange={handleFormChange} placeholder="Description" className={inputClass} />
                    <button type="submit" className={buttonClass}>Save Category</button>
                </form>);
            case 'addSubscriptionPlan': case 'editSubscriptionPlan':
                return (<form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Plan Name" className={inputClass} required/>
                    <input type="number" name="price" value={formState.price || ''} onChange={handleFormChange} placeholder="Price" className={inputClass} required/>
                    <input name="duration" value={formState.duration || ''} onChange={handleFormChange} placeholder="Duration (e.g., /month)" className={inputClass} />
                    <div className="flex items-center"><input type="checkbox" id="bestValue" name="bestValue" checked={!!formState.bestValue} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/><label htmlFor="bestValue" className="ml-2 block text-sm text-gray-900">Best Value</label></div>
                    <button type="submit" className={buttonClass}>Save Plan</button>
                </form>);
            default: return null;
        }
    };

    const CustomerDetailsDrawer = () => {
        if (!selectedCustomer) return null;
        return (
             <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 z-40 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="p-6">
                    <button onClick={closeDrawer} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
                    <h2 className="text-2xl font-bold mb-6">{selectedCustomer.name}</h2>
                    {/* ... Your existing customer details JSX ... */}
                    
                    {/* --- This is the new section to add --- */}
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Management</h3>
                        {isLoadingSub ? <p>Loading subscription...</p> : (
                            <SubscriptionManagementAdminView 
                                subscription={customerSubscription}
                                deliveries={deliveries}
                                agents={agents}
                                onPause={onAdminPauseSubscription}
                                onResume={onAdminResumeSubscription}
                                onCancel={onAdminCancelSubscription}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };
  
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview deliveries={deliveries} payments={payments} customers={customers} agents={agents} />;
            case 'customers':
                return <CustomerManagement customers={customers} deliveries={deliveries} payments={payments} onSelectCustomer={handleSelectCustomer} onUpdateCustomer={handleUpdateCustomerClick} onDeleteCustomer={onDeleteCustomer} onAddCustomer={() => openModal('addCustomer')} />;
            case 'live_map':
                return (<div className="h-[70vh] bg-white shadow-lg rounded-xl overflow-hidden"><LiveAgentTrackerPage /></div>);
            
            // ... (rest of your cases remain unchanged)
            case 'orders': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search by Order ID or Customer..." /> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredOrders.map(o => (<tr key={o.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.id}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.Customer?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{o.totalAmount}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={o.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td></tr>))}</tbody></table> </div> </div> );
            case 'products': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search products..." /> <div> <button onClick={() => openModal('addProduct')} className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 transition-colors w-full md:w-auto">+ Add Product</button> <button onClick={() => openModal('addCategory')} className="bg-purple-500 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-purple-600 transition-colors w-full md:w-auto ml-2">+ Add Category</button> </div> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredProducts.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.Category?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{p.price}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleUpdateProductClick(p)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeleteProduct(p.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table> </div> </div> );
            case 'subscriptions': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search plans..." /> <button onClick={() => openModal('addSubscriptionPlan')} className="bg-teal-500 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-teal-600 transition-colors w-full md:w-auto">+ Add Plan</button> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Value</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredSubscriptionPlans.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{p.price}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.duration}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.bestValue ? 'Yes' : 'No'}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleUpdateSubscriptionPlanClick(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button></td></tr>))}</tbody></table> </div> </div> );
            case 'deliveries': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search by customer or agent..." /> <button onClick={() => openModal('createDelivery')} className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 transition-colors w-full md:w-auto">+ Create Delivery</button> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredDeliveries.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.customer?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.agent?.name || 'Unassigned'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(d.delivery_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={d.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.is_recurring ? 'Yes' : 'No'}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleUpdateDeliveryClick(d)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeleteDelivery(d.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table> </div> </div> );
            case 'agents': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search by name or email..." /> <button onClick={() => openModal('addAgent')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors w-full md:w-auto">+ Add Agent</button> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredAgents.map(a => (<tr key={a.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div>{a.email}</div><div>{a.mobile}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.join_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={a.salary_status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleUpdateAgentClick(a)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeleteAgent(a.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table> </div> </div> );
            case 'payments': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search by customer..." /> <button onClick={() => openModal('addPayment')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors w-full md:w-auto">+ Add Payment</button> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredPayments.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.customer?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{p.amount}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={p.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.due_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => openModal('editPayment', p)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeletePayment(p.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table> </div> </div> );
            case 'support': return ( <div className="bg-white shadow-lg rounded-xl p-4 md:p-6"> <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"> <SearchBar onSearch={setSearchTerm} placeholder="Search by agent..." /> </div> <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredSupportTickets.map(t => (<tr key={t.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.agent?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.issueType}</td><td className="px-6 py-4 text-sm text-gray-500">{t.details}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={t.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{t.status === 'Open' && <button onClick={() => onResolveTicket(t.id)} className="text-green-600 hover:text-green-900">Resolve</button>}</td></tr>))}</tbody></table> </div> </div> );
            case 'reports': return <ReportsAndExport deliveries={deliveries} payments={payments} agents={agents} />;
            default: return null;
        }
    };
  
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <nav className="w-64 bg-white shadow-lg flex-shrink-0">
            <div className="p-6 flex items-center gap-3">
                 <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelo_iswxmn.jpg" alt="Logo" className="h-10 w-auto"/>
                 <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
            </div>
            <div className="mt-6">
                <TabButton label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <TabButton label="Orders" isActive={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                <TabButton label="Products" isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                <TabButton label="Subscriptions" isActive={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} />
                <TabButton label="Deliveries" isActive={activeTab === 'deliveries'} onClick={() => setActiveTab('deliveries')} />
                <TabButton label="Customers" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                <TabButton label="Agents" isActive={activeTab === 'agents'} onClick={() => setActiveTab('agents')} />
                <TabButton label="Payments" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                <TabButton label="Live Map" isActive={activeTab === 'live_map'} onClick={() => setActiveTab('live_map')} />
                <TabButton label="Support" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                <TabButton label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            </div>
        </nav>
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-sm p-4 flex justify-end">
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">Logout</button>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                {renderContent()}
            </main>
        </div>
        <CustomerDetailsDrawer />
        {isDrawerOpen && <div className="fixed inset-0 bg-black opacity-50 z-30" onClick={closeDrawer}></div>}
      </div>
    );
}
