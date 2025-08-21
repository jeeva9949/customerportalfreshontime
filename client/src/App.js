import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';

// --- IMPORT YOUR COMPONENTS AND HOOKS ---
import LiveAgentTrackerPage from './components/LiveAgentTracker';
import DashboardOverview from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import { useLocationTracker } from './hooks/useLocationTracker';
import CustomerPortal from './components/CustomerPortal';

// --- Configuration ---
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// --- Reusable UI Components ---
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
const Modal = ({ title, children, onClose }) => {
    return ReactDOM.createPortal(
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-4">
                <div className="bg-white rounded-lg shadow-xl transform transition-all animate-scale-in">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl p-1 rounded-full hover:bg-gray-100">&times;</button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <Modal title={title} onClose={onCancel}>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Confirm</button></div>
    </Modal>
);
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
                <div className="flex justify-end items-center mb-4"><div className="flex gap-2"><CSVLink data={getCsvData()} filename={`${reportType}_report.csv`} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>Export CSV</CSVLink><button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>Export PDF</button></div></div>
                <div className="overflow-x-auto bg-white rounded-lg shadow">{filteredData.length > 0 ? (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>{reportType === 'payments' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredData.map(item => (<tr key={item.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(item.delivery_date || item.due_date), 'yyyy-MM-dd')}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.customer?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.agent?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={item.status} /></td>{reportType === 'payments' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.amount}</td>}</tr>))}</tbody></table>) : ( <div className="text-center py-10 text-gray-500">No data found for the selected filters.</div> )}</div>
            </div>
        </div>
    );
};


// --- Authentication Page Component (UPDATED) ---
function AuthPage({ onAdminAgentLogin, onAdminRegister, onCustomerAuth, onBack, initialUserType = 'customer' }) {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState(initialUserType);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', mobile: '', adminCode: '' });
    const [error, setError] = useState('');

    // This effect ensures the form correctly resets when navigating from footer links
    useEffect(() => {
        setUserType(initialUserType);
        setIsLogin(true); // Always default to login when switching types
        setError('');
        setFormData({ name: '', email: '', password: '', mobile: '', adminCode: '' });
    }, [initialUserType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (userType === 'customer') {
                await onCustomerAuth(formData, isLogin);
            } else {
                if (isLogin) {
                    await onAdminAgentLogin(formData.email, formData.password, userType);
                } else { // Admin Registration
                    await onAdminRegister(formData.name, formData.email, formData.password, formData.adminCode);
                    alert('Admin Registration successful! Please log in.');
                    // Switch back to admin login form after successful registration
                    setUserType('admin');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const switchAuthMode = (newIsLogin, newUserType) => {
        setIsLogin(newIsLogin);
        setUserType(newUserType);
        setError('');
        setFormData({ name: '', email: '', password: '', mobile: '', adminCode: '' });
    };

    const getTitle = () => {
        if (userType === 'admin') return isLogin ? 'Admin Login' : 'Admin Registration';
        if (userType === 'agent') return 'Agent Login';
        return isLogin ? 'Welcome Back!' : 'Create a Customer Account';
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <button onClick={onBack} className="text-gray-600 hover:text-orange-500 transition-colors">&larr; Back to Home</button>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg w-full">
                    <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="w-24 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{getTitle()}</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (userType === 'customer' || userType === 'admin') && (
                           <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="p-3 border rounded-lg w-full" required />
                        )}
                        {!isLogin && userType === 'customer' && (
                            <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Phone Number" className="p-3 border rounded-lg w-full" required />
                        )}
                        {!isLogin && userType === 'admin' && (
                            <input type="text" name="adminCode" value={formData.adminCode} onChange={handleInputChange} placeholder="Admin Registration Code" className="p-3 border rounded-lg w-full" required />
                        )}
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="p-3 border rounded-lg w-full" required />
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="p-3 border rounded-lg w-full" required />
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 w-full rounded-lg transition-colors">{isLogin ? 'Login' : 'Sign Up'}</button>
                    </form>

                    <div className="text-center mt-4 text-sm text-gray-600">
                        {userType === 'customer' && (
                            isLogin
                            ? <>Don't have an account? <button onClick={() => switchAuthMode(false, 'customer')} className="font-semibold text-orange-500 hover:underline">Sign Up</button></>
                            : <>Already have an account? <button onClick={() => switchAuthMode(true, 'customer')} className="font-semibold text-orange-500 hover:underline">Login</button></>
                        )}
                        {userType === 'admin' && isLogin && (
                           <>Need to register a new Admin? <button onClick={() => switchAuthMode(false, 'admin')} className="font-semibold text-orange-500 hover:underline">Register</button></>
                        )}
                    </div>

                     <div className="text-center mt-2 text-xs text-gray-400">
                        <button onClick={() => switchAuthMode(true, 'admin')} className="hover:underline">Admin Login</button>
                        <span className="mx-1">&middot;</span>
                        <button onClick={() => switchAuthMode(true, 'agent')} className="hover:underline">Agent Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Admin Dashboard Component (Existing Code) ---
function AdminDashboard({ onLogout, customers, agents, deliveries, payments, supportTickets, passwordRequests, onAddCustomer, onAddAgent, onCreateDelivery, onUpdateCustomer, onDeleteCustomer, onUpdateAgent, onDeleteAgent, onUpdateDelivery, onDeleteDelivery, onAddPayment, onUpdatePayment, onDeletePayment, onResolveTicket, onApprovePassword }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formState, setFormState] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
  
    const openModal = useCallback((type, item = null) => {
        setModalType(type);
        if (item) { 
            setFormState(item);
        } else {
            const defaultState = {
                addCustomer: { name: '', address: '', mobile: '', email: '', first_purchase_date: new Date().toISOString().split('T')[0] },
                addAgent: { name: '', mobile: '', email: '', password: '', join_date: new Date().toISOString().split('T')[0], salary_status: 'Unpaid', bank_details: '' },
                createDelivery: { customer_id: '', agent_id: '', item: 'Tropical Fruit Bowl', delivery_date: new Date().toISOString().split('T')[0], status: 'Pending', is_recurring: false },
                addPayment: { customer_id: '', amount: '', status: 'Due', due_date: new Date().toISOString().split('T')[0] }
            };
            setFormState(defaultState[type]);
        }
        setIsModalOpen(true);
    }, []);
  
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
            default: break;
        }
        setIsModalOpen(false);
    };

    const handleAddCustomerClick = useCallback(() => openModal('addCustomer'), [openModal]);
    const handleUpdateCustomerClick = useCallback((customer) => openModal('editCustomer', customer), [openModal]);

    const filteredDeliveries = useMemo(() => deliveries.filter(d => (d.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.agent?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [deliveries, searchTerm]);
    const filteredAgents = useMemo(() => agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())), [agents, searchTerm]);
    const filteredPayments = useMemo(() => payments.filter(p => (p.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [payments, searchTerm]);
    const filteredSupportTickets = useMemo(() => supportTickets.filter(t => (t.agent?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [supportTickets, searchTerm]);
    const filteredPasswordRequests = useMemo(() => passwordRequests.filter(r => (r.agent?.name || '').toLowerCase().includes(searchTerm.toLowerCase())), [passwordRequests, searchTerm]);
  
    const renderModalContent = () => {
        if (!isModalOpen) return null;
        const fruitBowlTypes = ['Tropical Fruit Bowl', 'Berry Blast Bowl', 'Citrus Mix', 'Custom'];
        const inputClass = "p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-500";
        const labelClass = "block text-sm font-medium text-gray-700";
        const buttonClass = "w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm";

        switch (modalType) {
            case 'addCustomer': case 'editCustomer':
                const purchaseDate = (formState.first_purchase_date && typeof formState.first_purchase_date === 'string')
                    ? formState.first_purchase_date.split('T')[0]
                    : '';
                return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Name" className={inputClass} required/><input name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Email" className={inputClass} required/><input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className={inputClass} required/><textarea name="address" value={formState.address || ''} onChange={handleFormChange} placeholder="Address" className={inputClass} required/><div><label className={labelClass}>First Purchase</label><input type="date" name="first_purchase_date" value={purchaseDate} onChange={handleFormChange} className={inputClass}/></div><button type="submit" className={buttonClass}>Save Customer</button></form>);
            case 'addAgent': case 'editAgent':
                 return (<form onSubmit={handleSubmit} className="space-y-4"><input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Agent Name" className={inputClass} required/><input type="email" name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Login Email" className={inputClass} required/><input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className={inputClass} required/>{modalType === 'addAgent' && <input type="password" name="password" value={formState.password || ''} onChange={handleFormChange} placeholder="Login Password" className={inputClass} required/>}<textarea name="bank_details" value={formState.bank_details || ''} onChange={handleFormChange} placeholder="Bank Details (Account #, IFSC)" className={inputClass}/><div><label className={labelClass}>Joined Date</label><input type="date" name="join_date" value={formState.join_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><div><label className={labelClass}>Salary Status</label><select name="salary_status" value={formState.salary_status || 'Unpaid'} onChange={handleFormChange} className={inputClass}><option>Unpaid</option><option>Paid</option></select></div><button type="submit" className={buttonClass}>Save Agent</button></form>);
            case 'createDelivery': case 'editDelivery':
                return (<form onSubmit={handleSubmit} className="space-y-4"><select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select name="agent_id" value={formState.agent_id || ''} onChange={handleFormChange} className={inputClass}><option value="">Assign Later (Automatic)</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select><input type="date" name="delivery_date" value={formState.delivery_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass} required /><select name="item" value={formState.item || fruitBowlTypes[0]} onChange={handleFormChange} className={inputClass}>{fruitBowlTypes.map(b => <option key={b} value={b}>{b}</option>)}</select><select name="status" value={formState.status || 'Pending'} onChange={handleFormChange} className={inputClass}><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select><div className="flex items-center"><input type="checkbox" id="is_recurring" name="is_recurring" checked={!!formState.is_recurring} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/><label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-900">Recurring Daily Delivery</label></div><button type="submit" className={buttonClass}>Save Delivery</button></form>);
            case 'addPayment': case 'editPayment':
                return (<form onSubmit={handleSubmit} className="space-y-4"><select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className={inputClass} required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="number" name="amount" value={formState.amount || ''} onChange={handleFormChange} placeholder="Amount" className={inputClass} required/><div><label className={labelClass}>Due Date</label><input type="date" name="due_date" value={formState.due_date?.split('T')[0] || ''} onChange={handleFormChange} className={inputClass}/></div><select name="status" value={formState.status || 'Due'} onChange={handleFormChange} className={inputClass}><option>Due</option><option>Paid</option><option>Overdue</option></select><button type="submit" className={buttonClass}>Save Payment</button></form>);
            default: return null;
        }
    };
  
    return (
      <div className="p-4 md:p-8 bg-slate-100 min-h-screen">
        {isModalOpen && <Modal title={modalType.includes('edit') ? 'Edit Details' : 'Add New'} onClose={() => setIsModalOpen(false)}>{renderModalContent()}</Modal>}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
                <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-10 w-auto"/>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div><button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">Logout</button></div>
        </header>
        <div className="bg-white p-2 rounded-lg shadow-sm mb-6">
            <div className="flex gap-1 flex-wrap">
                <TabButton label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <TabButton label="Deliveries" isActive={activeTab === 'deliveries'} onClick={() => setActiveTab('deliveries')} />
                <TabButton label="Customers" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                <TabButton label="Agents" isActive={activeTab === 'agents'} onClick={() => setActiveTab('agents')} />
                <TabButton label="Payments" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                <TabButton label="Live Map" isActive={activeTab === 'live_map'} onClick={() => setActiveTab('live_map')} />
                <TabButton label="Support" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                <TabButton label="Password Requests" isActive={activeTab === 'password_requests'} onClick={() => setActiveTab('password_requests')} />
                <TabButton label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            </div>
        </div>
        
        {activeTab === 'dashboard' && <DashboardOverview deliveries={deliveries} payments={payments} agents={agents} customers={customers} />}
        {activeTab === 'customers' && <CustomerManagement customers={customers} deliveries={deliveries} payments={payments} onUpdateCustomer={handleUpdateCustomerClick} onDeleteCustomer={onDeleteCustomer} onAddCustomer={handleAddCustomerClick} />}

        {activeTab === 'live_map' && (<div className="h-[70vh] bg-white shadow-lg rounded-xl overflow-hidden"><LiveAgentTrackerPage /></div>)}
        {activeTab !== 'dashboard' && activeTab !== 'live_map' && activeTab !== 'customers' && (
            <div className="bg-white shadow-lg rounded-xl p-4 md:p-6">
                {activeTab !== 'reports' && (
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <SearchBar onSearch={setSearchTerm} placeholder="Search..." />
                        {activeTab === 'deliveries' && <button onClick={() => openModal('createDelivery')} className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 transition-colors w-full md:w-auto">+ Create Delivery</button>}
                        {activeTab === 'agents' && <button onClick={() => openModal('addAgent')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors w-full md:w-auto">+ Add Agent</button>}
                        {activeTab === 'payments' && <button onClick={() => openModal('addPayment')} className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors w-full md:w-auto">+ Add Payment</button>}
                    </div>
                )}
                <div className="overflow-x-auto">
                    {activeTab === 'deliveries' && (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredDeliveries.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.customer?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.agent?.name || 'Unassigned'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(d.delivery_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={d.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.is_recurring ? 'Yes' : 'No'}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => openModal('editDelivery', d)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeleteDelivery(d.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table>)}
                    {activeTab === 'agents' && (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredAgents.map(a => (<tr key={a.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div>{a.email}</div><div>{a.mobile}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.join_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={a.salary_status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => openModal('editAgent', a)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeleteAgent(a.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table>)}
                    {activeTab === 'payments' && (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredPayments.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.customer?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.amount}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={p.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.due_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => openModal('editPayment', p)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button><button onClick={() => onDeletePayment(p.id)} className="text-red-600 hover:text-red-900">Delete</button></td></tr>))}</tbody></table>)}
                    {activeTab === 'support' && (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredSupportTickets.map(t => (<tr key={t.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.agent?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.issueType}</td><td className="px-6 py-4 text-sm text-gray-500">{t.details}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={t.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{t.status === 'Open' && <button onClick={() => onResolveTicket(t.id)} className="text-green-600 hover:text-green-900">Resolve</button>}</td></tr>))}</tbody></table>)}
                    {activeTab === 'password_requests' && (<table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredPasswordRequests.map(r => (<tr key={r.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.agent?.name}</td><td className="px-6 py-4 whitespace-nowrap"><StatusPill status={r.status} /></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{r.status === 'Pending' && <button onClick={() => onApprovePassword(r.id)} className="text-green-600 hover:text-green-900">Approve</button>}</td></tr>))}</tbody></table>)}
                    {activeTab === 'reports' && (<ReportsAndExport deliveries={deliveries} payments={payments} agents={agents} />)}
                </div>
            </div>
        )}
      </div>
    );
}

// --- Agent Portal Component (Existing Code) ---
function AgentPortal({ agent, allDeliveries, allAgents, allCustomers, onLogout, onUpdateDelivery, onReportIssue, onRequestPasswordChange, onUpdateNotificationPreference }) {
    const { isTracking, error: trackingError } = useLocationTracker(agent);
    const [activeTab, setActiveTab] = useState('deliveries');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [issueType, setIssueType] = useState('Incorrect Address');
    const [issueDetails, setIssueDetails] = useState('');
    
    const agentDetails = useMemo(() => allAgents.find(a => a.id === agent.id) || agent, [agent, allAgents]);
    
    const notificationsEnabled = agentDetails.notifications_enabled;

    const agentDeliveries = useMemo(() => allDeliveries.filter(d => d.agent_id === agent.id), [allDeliveries, agent.id]);
    const todaysDeliveries = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return agentDeliveries.filter(d => d.delivery_date.slice(0, 10) === today);
    }, [agentDeliveries]);
    const activeDeliveries = useMemo(() => todaysDeliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit'), [todaysDeliveries]);
    const historyDeliveries = useMemo(() => agentDeliveries.filter(d => ['Delivered', 'Failed', 'Cancelled'].includes(d.status)).sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date)), [agentDeliveries]);
    const stats = useMemo(() => ({
        total: todaysDeliveries.length,
        pending: activeDeliveries.length,
        completed: todaysDeliveries.filter(d => d.status === 'Delivered').length
    }), [todaysDeliveries, activeDeliveries]);

    const openStatusModal = (delivery) => { setSelectedDelivery(delivery); setIsModalOpen(true); };
    const handleStatusUpdate = (newStatus) => { if (selectedDelivery) { onUpdateDelivery({ ...selectedDelivery, status: newStatus }); } setIsModalOpen(false); };
    const handleReportSubmit = (e) => { e.preventDefault(); onReportIssue({ issueType, details: issueDetails }); setIssueDetails(''); alert('Support ticket submitted successfully!'); };
    const handleSaveChanges = () => { if (newPassword) { if (newPassword.length < 6) { alert("Password must be at least 6 characters long."); return; } onRequestPasswordChange(newPassword); setNewPassword(''); alert('Password change requested. An admin will approve it shortly.'); }};
    
    const handleNotificationToggle = () => { 
        const newPreference = !notificationsEnabled; 
        onUpdateNotificationPreference(newPreference); 
    };
    const handleNavigate = (address) => { if (!address) { alert("Address not available."); return; } window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank'); };

    const BottomNavLink = ({ page, label, icon }) => (<button onClick={() => setActiveTab(page)} className={`flex flex-col items-center justify-center w-full transition-colors py-1 ${activeTab === page ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}><span className="text-2xl">{icon}</span><span className="text-xs font-medium">{label}</span></button>);
    const PageHeader = () => { let title = 'Deliveries'; if (activeTab === 'history') title = 'History'; if (activeTab === 'profile') title = 'Profile'; if (activeTab === 'support') title = 'Support'; return (<header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 p-4"><div className="flex justify-between items-center"><div className="flex items-center gap-4"><img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="Logo" className="h-8 w-auto rounded-md"/><h1 className="text-xl font-bold text-orange-400">{title}</h1></div><div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${isTracking ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}><span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>{isTracking ? 'Tracking Live' : 'Tracking Off'}</div></div>{trackingError && <p className="text-xs text-red-400 text-center mt-2">{trackingError}</p>}</header>); };

    const renderPageContent = () => {
        switch(activeTab) {
            case 'history': return (<div className="p-4 space-y-2"><h2 className="text-xl font-bold text-gray-200">Delivery History</h2>{historyDeliveries.length > 0 ? historyDeliveries.map(delivery => { const customer = allCustomers.find(c => c.id === delivery.customer_id); return (<div key={delivery.id} className="bg-slate-800 p-4 rounded-xl border-b border-slate-700/50"><div className="flex justify-between items-center"><div><h4 className="font-semibold text-lg text-white">{customer?.name || 'N/A'}</h4><p className="text-sm text-gray-400">{customer?.address || 'N/A'}</p><p className="text-xs text-gray-500 mt-1">Completed: {new Date(delivery.updatedAt).toLocaleDateString()}</p></div><StatusPill status={delivery.status} /></div></div>);}) : <div className="text-center text-gray-500 mt-8 p-10 bg-slate-800 rounded-xl">No past deliveries found.</div>}</div>);
            case 'profile': return (<div className="p-4"><h2 className="text-xl font-bold text-gray-200 mb-4">Profile & Settings</h2><div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-2xl mx-auto"><div className="flex items-center space-x-4 mb-6"><div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold">{agentDetails.name.charAt(0).toUpperCase()}</div><div><h3 className="text-xl font-bold text-white">{agentDetails.name}</h3><p className="text-gray-400">{agentDetails.email}</p><p className="text-gray-400">{agentDetails.mobile || '+1 (555) 123-4567'}</p></div></div><div className="space-y-6"><div><label className="block text-sm font-medium text-gray-400 mb-1">Update Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="mt-1 block w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"/></div><div className="flex items-center justify-between"><span className="font-medium text-gray-300">Notifications</span><label htmlFor="notifications-toggle" className="inline-flex relative items-center cursor-pointer"><input type="checkbox" checked={notificationsEnabled} onChange={handleNotificationToggle} id="notifications-toggle" className="sr-only peer"/><div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div></label></div><button onClick={handleSaveChanges} className="w-full bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Save Changes</button></div></div></div>);
            case 'support': return (<div className="p-4"><h2 className="text-xl font-bold text-gray-200 mb-4">Support</h2><div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-2xl mx-auto space-y-8"><div><h3 className="text-lg font-semibold text-white mb-3">Contact Admin</h3><div className="flex gap-4"><a href="tel:+919493532772" className="flex-1 flex items-center justify-center gap-2 border border-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"><span>📞</span> Call Support</a><button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"><span>💬</span> Chat with Admin</button></div></div><div><h3 className="text-lg font-semibold text-white mb-3">Report an Issue</h3><form onSubmit={handleReportSubmit} className="space-y-4"><select value={issueType} onChange={e => setIssueType(e.target.value)} className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"><option>Incorrect Address</option><option>Customer Not Available</option><option>Package Damaged</option><option>Vehicle Issue</option><option>Other</option></select><textarea value={issueDetails} onChange={e => setIssueDetails(e.target.value)} rows="4" className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Provide more details..."></textarea><button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">Submit Report</button></form></div></div></div>);
            default: return (<div className="p-4"><div className="bg-slate-800 p-4 rounded-xl mb-6"><div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-white">Welcome, {agent.name}!</h2><p className="text-gray-400">Here's your summary for today.</p></div><button onClick={onLogout} className="p-2 rounded-full text-gray-400 hover:bg-slate-700"><span className="text-2xl">→</span></button></div></div><div className="grid grid-cols-3 gap-4 mb-6"><div className="bg-slate-800 p-4 rounded-xl text-center"><p className="text-gray-400 text-sm font-medium">Today's</p><p className="text-3xl font-bold text-white">{stats.total}</p></div><div className="bg-slate-800 p-4 rounded-xl text-center"><p className="text-gray-400 text-sm font-medium">Pending</p><p className="text-3xl font-bold text-yellow-400">{stats.pending}</p></div><div className="bg-slate-800 p-4 rounded-xl text-center"><p className="text-gray-400 text-sm font-medium">Completed</p><p className="text-3xl font-bold text-green-400">{stats.completed}</p></div></div><h3 className="text-lg font-bold mb-3 text-gray-300 px-4">Active Deliveries</h3><div className="space-y-4">{activeDeliveries.length > 0 ? activeDeliveries.map(delivery => { const customer = allCustomers.find(c => c.id === delivery.customer_id); return (<div key={delivery.id} className="bg-slate-800 p-4 rounded-xl"><div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-lg text-white">{customer?.name || 'N/A'}</h4><p className="text-sm text-gray-400">{customer?.address || 'N/A'}</p></div><StatusPill status={delivery.status} /></div><div className="flex gap-3 mt-4"><button onClick={() => handleNavigate(customer?.address)} className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"><span>⎋</span> Navigate</button><button onClick={() => openStatusModal(delivery)} className="flex-1 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center gap-2"><span>✎</span> Update Status</button></div></div>);}) : <p className="text-center text-gray-500 mt-8 py-10 bg-slate-800 rounded-xl">No active deliveries for today.</p>}</div></div>);
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-gray-300">
            {isModalOpen && (<Modal title="Update Delivery Status" onClose={() => setIsModalOpen(false)}><div className="space-y-4 text-white"><p>Update status for <strong>{allCustomers.find(c => c.id === selectedDelivery.customer_id)?.name}</strong>:</p><div className="flex flex-col sm:flex-row justify-around gap-3"><button onClick={() => handleStatusUpdate('In Transit')} className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold">In Transit</button><button onClick={() => handleStatusUpdate('Delivered')} className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold">Delivered</button><button onClick={() => handleStatusUpdate('Failed')} className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold">Failed</button></div></div></Modal>)}
            <main className="pb-20"><PageHeader />{renderPageContent()}</main>
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 flex justify-around z-20"><BottomNavLink page="deliveries" label="Deliveries" icon="📦" /><BottomNavLink page="history" label="History" icon="🕒" /><BottomNavLink page="profile" label="Profile" icon="👤" /><BottomNavLink page="support" label="Support" icon="💡" /></nav>
        </div>
    );
}


// --- Main App Component (Root) ---
export default function App() {
    const [view, setView] = useState('customer_portal');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [initialAuthType, setInitialAuthType] = useState('customer');
    
    const [customers, setCustomers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [payments, setPayments] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [passwordRequests, setPasswordRequests] = useState([]);
    const [confirmState, setConfirmState] = useState({ isOpen: false });

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setLoggedInUser(null);
        setView('customer_portal');
    }, []);
  
    const fetchData = useCallback(async (currentToken) => {
        if (!currentToken) return;
        try {
            const authHeader = { 'Authorization': `Bearer ${currentToken}` };
            const [customersRes, agentsRes, deliveriesRes, paymentsRes, supportRes, passwordRes] = await Promise.all([
                fetch(`${API_URL}/customers`, { headers: authHeader }),
                fetch(`${API_URL}/agents`, { headers: authHeader }),
                fetch(`${API_URL}/deliveries`, { headers: authHeader }),
                fetch(`${API_URL}/payments`, { headers: authHeader }),
                fetch(`${API_URL}/support`, { headers: authHeader }),
                fetch(`${API_URL}/password-requests`, { headers: authHeader })
            ]);
            
            const checkResponse = async (res, setter) => {
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setter(data);
                } else console.error(`Failed to fetch ${setter.name}`);
            };
            
            await checkResponse(customersRes, setCustomers);
            await checkResponse(agentsRes, setAgents);
            await checkResponse(deliveriesRes, setDeliveries);
            await checkResponse(paymentsRes, setPayments);
            await checkResponse(supportRes, setSupportTickets);
            await checkResponse(passwordRes, setPasswordRequests);

        } catch (error) {
            console.error("Fetch data error:", error);
            handleLogout();
        }
    }, [handleLogout]);

    useEffect(() => {
        const userFromStorage = localStorage.getItem('user');
        if (token && userFromStorage) {
            try {
                const parsedUser = JSON.parse(userFromStorage);
                setLoggedInUser(parsedUser);
                if (parsedUser.role === 'Admin') setView('admin_dashboard');
                else if (parsedUser.role === 'Agent') setView('agent_portal');
                else setView('customer_portal');
            } catch (e) { handleLogout(); }
        } else {
            setLoggedInUser(null);
            setView('customer_portal');
        }
    }, [token, handleLogout]);

    useEffect(() => {
        if (token && loggedInUser?.role !== 'Customer') {
            fetchData(token);
        }
    }, [loggedInUser, token, fetchData]);

    useEffect(() => {
        if (!token) return;
        const socket = io(SOCKET_URL);
        const refetch = () => {
            if(loggedInUser?.role !== 'Customer') fetchData(token);
        };
        socket.on('connect', () => console.log('WebSocket connected!'));
        socket.on('connect_error', (err) => console.error('WebSocket connection error:', err.message));
        socket.on('deliveries_updated', refetch);
        socket.on('support_tickets_updated', refetch);
        socket.on('password_requests_updated', refetch);
        socket.on('customers_updated', refetch);
        socket.on('agents_updated', refetch);
        socket.on('payments_updated', refetch);
        return () => socket.disconnect();
    }, [token, loggedInUser, fetchData]);

    const handleApiError = async (response) => {
        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An unknown error occurred');
            } catch (e) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
        }
        return response;
    };

    const handleAdminRegister = async (name, email, password, adminCode) => {
        const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, adminCode }) });
        await handleApiError(res);
    };

    const handleCustomerAuth = async (authData, isLogin) => {
        const endpoint = isLogin ? 'login' : 'register';
        const res = await fetch(`${API_URL}/customer-auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authData) });
        await handleApiError(res);
        if (isLogin) {
            const { token: newToken, user } = await res.json();
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(newToken);
        } else {
            alert('Sign up successful! Please log in.');
        }
    };

    const handleAdminAgentLogin = async (email, password, userType) => {
        const loginUrl = userType === 'admin' ? `${API_URL}/auth/login` : `${API_URL}/agents/login`;
        const res = await fetch(loginUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        await handleApiError(res);
        const { token: newToken, user } = await res.json();
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(newToken);
    };
    
    const handlePortalLinkClick = (userType) => {
        setInitialAuthType(userType); // 'admin' or 'agent'
        setView('auth');
    };

    const apiRequest = useCallback(async (endpoint, method, body = null) => {
        try {
            const authHeader = { 'Authorization': `Bearer ${token}` };
            const options = { method, headers: { ...authHeader, 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(`${API_URL}${endpoint}`, options);
            await handleApiError(res);
        } catch (error) {
            console.error(`API request to ${endpoint} failed:`, error);
            alert(`Error: ${error.message}`);
        }
    }, [token]);
  
    const requestConfirmation = useCallback((title, message, onConfirm) => { setConfirmState({ isOpen: true, title, message, onConfirm }); }, []);
    const handleConfirm = useCallback(() => { if (confirmState.onConfirm) confirmState.onConfirm(); setConfirmState({ isOpen: false }); }, [confirmState]);
    const handleCancelConfirm = useCallback(() => { setConfirmState({ isOpen: false }); }, []);

    const handleAddCustomer = useCallback((customer) => apiRequest('/customers', 'POST', customer), [apiRequest]);
    const handleUpdateCustomer = useCallback((customer) => apiRequest(`/customers/${customer.id}`, 'PUT', customer), [apiRequest]);
    const handleDeleteCustomer = useCallback((id) => requestConfirmation('Delete Customer?', 'Are you sure?', () => apiRequest(`/customers/${id}`, 'DELETE')), [apiRequest, requestConfirmation]);
    const handleAddAgent = useCallback((agent) => apiRequest('/agents', 'POST', agent), [apiRequest]);
    const handleUpdateAgent = useCallback((agent) => apiRequest(`/agents/${agent.id}`, 'PUT', agent), [apiRequest]);
    const handleDeleteAgent = useCallback((id) => requestConfirmation('Delete Agent?', 'Are you sure?', () => apiRequest(`/agents/${id}`, 'DELETE')), [apiRequest, requestConfirmation]);
    const handleCreateDelivery = useCallback((delivery) => apiRequest('/deliveries', 'POST', delivery), [apiRequest]);
    const handleUpdateDelivery = useCallback((delivery) => apiRequest(`/deliveries/${delivery.id}`, 'PUT', delivery), [apiRequest]);
    const handleDeleteDelivery = useCallback((id) => requestConfirmation('Delete Delivery?', 'Are you sure?', () => apiRequest(`/deliveries/${id}`, 'DELETE')), [apiRequest, requestConfirmation]);
    const handleAddPayment = useCallback((payment) => apiRequest('/payments', 'POST', payment), [apiRequest]);
    const handleUpdatePayment = useCallback((payment) => apiRequest(`/payments/${payment.id}`, 'PUT', payment), [apiRequest]);
    const handleDeletePayment = useCallback((id) => requestConfirmation('Delete Payment?', 'Are you sure?', () => apiRequest(`/payments/${id}`, 'DELETE')), [apiRequest, requestConfirmation]);
    const handleReportIssue = useCallback((issue) => apiRequest('/support', 'POST', issue), [apiRequest]);
    const handleResolveTicket = useCallback((ticketId) => apiRequest(`/support/${ticketId}`, 'PUT', { status: 'Resolved' }), [apiRequest]);
    const handleRequestPasswordChange = useCallback((newPassword) => apiRequest('/password-requests', 'POST', { newPassword }), [apiRequest]);
    const handleApprovePassword = useCallback((requestId) => apiRequest(`/password-requests/${requestId}/approve`, 'PUT'), [apiRequest]);
    const handleUpdateNotificationPreference = useCallback((preference) => apiRequest('/agents/notifications', 'PUT', { notifications_enabled: preference }), [apiRequest]);

    const renderView = () => {
        switch (view) {
            case 'admin_dashboard':
                return <AdminDashboard onLogout={handleLogout} customers={customers} agents={agents} deliveries={deliveries} payments={payments} supportTickets={supportTickets} passwordRequests={passwordRequests} onAddCustomer={handleAddCustomer} onAddAgent={handleAddAgent} onCreateDelivery={handleCreateDelivery} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} onUpdateAgent={handleUpdateAgent} onDeleteAgent={handleDeleteAgent} onUpdateDelivery={handleUpdateDelivery} onDeleteDelivery={handleDeleteDelivery} onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment} onResolveTicket={handleResolveTicket} onApprovePassword={handleApprovePassword} />;
            case 'agent_portal':
                return <AgentPortal agent={loggedInUser} allDeliveries={deliveries} allAgents={agents} allCustomers={customers} onLogout={handleLogout} onUpdateDelivery={handleUpdateDelivery} onReportIssue={handleReportIssue} onRequestPasswordChange={handleRequestPasswordChange} onUpdateNotificationPreference={handleUpdateNotificationPreference} />;
            case 'auth':
                return <AuthPage onAdminAgentLogin={handleAdminAgentLogin} onAdminRegister={handleAdminRegister} onCustomerAuth={handleCustomerAuth} onBack={() => setView('customer_portal')} initialUserType={initialAuthType} />;
            case 'customer_portal':
            default:
                return <CustomerPortal user={loggedInUser} onAuthClick={() => { setInitialAuthType('customer'); setView('auth'); }} onLogout={handleLogout} onPortalLinkClick={handlePortalLinkClick} />;
        }
    }

    return (
        <>
            {confirmState.isOpen && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancelConfirm} />}
            {renderView()}
        </>
    );
}
