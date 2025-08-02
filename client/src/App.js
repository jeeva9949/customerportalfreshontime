import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Configuration ---
// Define the backend API URL. Ensure your backend server is running on this port.
const API_URL = 'http://localhost:5000/api';

// --- Reusable UI Components ---

// Displays a colored pill for different statuses (e.g., Pending, Delivered).
const StatusPill = ({ status }) => {
    const statusClasses = {
        Pending: 'bg-yellow-400/20 text-yellow-300',
        'In Transit': 'bg-blue-400/20 text-blue-300',
        Delivered: 'bg-green-500/20 text-green-400',
        Failed: 'bg-red-500/20 text-red-400',
        Cancelled: 'bg-red-500/20 text-red-400',
        Open: 'bg-blue-400/20 text-blue-300',
        Closed: 'bg-gray-400/20 text-gray-300',
        Resolved: 'bg-green-500/20 text-green-400',
        Paid: 'bg-green-100 text-green-800',
        Unpaid: 'bg-red-100 text-red-800',
        Due: 'bg-yellow-100 text-yellow-800'
    };
    return <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status || 'N/A'}</span>;
};

// A generic modal component for pop-up forms and dialogs.
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
            </div>
            {children}
        </div>
    </div>
);

// A specific modal for confirming actions like deletion.
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <Modal title={title} onClose={onCancel}>
        <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex justify-end gap-4">
            <button onClick={onCancel} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
            <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Confirm</button>
        </div>
    </Modal>
);

// A styled button for navigating tabs in the admin dashboard.
const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{label}</button>
);

// A search input component.
const SearchBar = ({ onSearch, placeholder }) => (
    <input type="text" onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full md:w-1/3 mb-4 bg-white dark:bg-gray-700" />
);


// --- Authentication Page Component ---
function AuthPage({ onLogin, onRegister }) {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('agent');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await onLogin(email, password, userType);
            } else {
                if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
                await onRegister(name, email, password, adminCode);
                setIsLogin(true);
                alert('Admin Registration successful! Please log in.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">{isLogin ? `${userType.charAt(0).toUpperCase() + userType.slice(1)} Login` : 'Admin Registration'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="p-3 border rounded-lg w-full" required />
                            <input type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Admin Registration Code" className="p-3 border rounded-lg w-full" required />
                        </>
                    )}
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-3 border rounded-lg w-full" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-3 border rounded-lg w-full" required />
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors">{isLogin ? 'Sign In' : 'Register'}</button>
                </form>
            </div>
            <div className="text-center mt-4">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); if(!isLogin) setUserType('admin'); }} className="text-slate-600 hover:underline">
                    {isLogin ? "Need an admin account? Register" : "Already have an account? Login"}
                </button>
                {isLogin && (
                    <div className="mt-2">
                        <button onClick={() => setUserType(userType === 'admin' ? 'agent' : 'admin')} className="text-sm text-gray-600 hover:underline">
                            Switch to {userType === 'admin' ? 'Agent' : 'Admin'} Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Admin Dashboard Component ---
function AdminDashboard({ onLogout, customers, agents, deliveries, payments, supportTickets, passwordRequests, onAddCustomer, onAddAgent, onCreateDelivery, onUpdateCustomer, onDeleteCustomer, onUpdateAgent, onDeleteAgent, onUpdateDelivery, onDeleteDelivery, onAddPayment, onUpdatePayment, onDeletePayment, onResolveTicket, onApprovePassword }) {
    const [activeTab, setActiveTab] = useState('deliveries');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formState, setFormState] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
  
    const openModal = (type, item = null) => {
        setModalType(type);
        if (item) { 
            setFormState(item);
        } else {
            const defaultState = {
                addCustomer: { name: '', address: '', mobile: '', email: '', first_purchase_date: new Date().toISOString().split('T')[0] },
                addAgent: { name: '', mobile: '', email: '', password: '', join_date: new Date().toISOString().split('T')[0], salary_status: 'Unpaid', bank_details: '' },
                createDelivery: { customer_id: '', agent_id: '', item: 'Tropical Fruit Bowl', delivery_date: new Date().toISOString().split('T')[0], status: 'Pending' },
                addPayment: { customer_id: '', amount: '', status: 'Due', due_date: new Date().toISOString().split('T')[0] }
            };
            setFormState(defaultState[type]);
        }
        setIsModalOpen(true);
    };
  
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
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

    const filteredDeliveries = useMemo(() => deliveries.filter(d => {
        const customerName = d.customer?.name || '';
        const agentName = d.agent?.name || '';
        const searchTermLower = searchTerm.toLowerCase();
        return (customerName.toLowerCase().includes(searchTermLower) || agentName.toLowerCase().includes(searchTermLower));
    }), [deliveries, searchTerm]);

    const filteredCustomers = useMemo(() => customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm)), [customers, searchTerm]);
    const filteredAgents = useMemo(() => agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())), [agents, searchTerm]);
    const filteredPayments = useMemo(() => payments.filter(p => {
        const customerName = p.customer?.name || '';
        return customerName.toLowerCase().includes(searchTerm.toLowerCase());
    }), [payments, searchTerm]);
    const filteredSupportTickets = useMemo(() => supportTickets.filter(t => {
        const agentName = t.agent?.name || '';
        return agentName.toLowerCase().includes(searchTerm.toLowerCase());
    }), [supportTickets, searchTerm]);
    const filteredPasswordRequests = useMemo(() => passwordRequests.filter(r => {
        const agentName = r.agent?.name || '';
        return agentName.toLowerCase().includes(searchTerm.toLowerCase());
    }), [passwordRequests, searchTerm]);
  
    const renderModalContent = () => {
        if (!isModalOpen) return null;
        const fruitBowlTypes = ['Tropical Fruit Bowl', 'Berry Blast Bowl', 'Citrus Mix', 'Custom'];
        switch (modalType) {
            case 'addCustomer': case 'editCustomer':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Name" className="p-2 border rounded w-full" required/>
                        <input name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Email" className="p-2 border rounded w-full" required/>
                        <input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className="p-2 border rounded w-full" required/>
                        <textarea name="address" value={formState.address || ''} onChange={handleFormChange} placeholder="Address" className="p-2 border rounded w-full" required/>
                        <div><label className="text-sm">First Purchase</label><input type="date" name="first_purchase_date" value={formState.first_purchase_date?.split('T')[0] || ''} onChange={handleFormChange} className="p-2 border rounded w-full"/></div>
                        <button type="submit" className="bg-orange-500 text-white w-full py-2 rounded">Save Customer</button>
                    </form>
                );
            case 'addAgent': case 'editAgent':
                 return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Agent Name" className="p-2 border rounded w-full" required/>
                        <input type="email" name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Login Email" className="p-2 border rounded w-full" required/>
                        <input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className="p-2 border rounded w-full" required/>
                        {modalType === 'addAgent' && <input type="password" name="password" value={formState.password || ''} onChange={handleFormChange} placeholder="Login Password" className="p-2 border rounded w-full" required/>}
                        <textarea name="bank_details" value={formState.bank_details || ''} onChange={handleFormChange} placeholder="Bank Details (Account #, IFSC)" className="p-2 border rounded w-full"/>
                        <div><label className="text-sm">Joined Date</label><input type="date" name="join_date" value={formState.join_date?.split('T')[0] || ''} onChange={handleFormChange} className="p-2 border rounded w-full"/></div>
                        <div><label className="text-sm">Salary Status</label><select name="salary_status" value={formState.salary_status || 'Unpaid'} onChange={handleFormChange} className="p-2 border rounded w-full"><option>Unpaid</option><option>Paid</option></select></div>
                        <button type="submit" className="bg-orange-500 text-white w-full py-2 rounded">Save Agent</button>
                    </form>
                );
            case 'createDelivery': case 'editDelivery':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className="p-2 border rounded w-full" required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <select name="agent_id" value={formState.agent_id || ''} onChange={handleFormChange} className="p-2 border rounded w-full" required><option value="">Assign to Agent</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                        <input type="date" name="delivery_date" value={formState.delivery_date?.split('T')[0] || ''} onChange={handleFormChange} className="p-2 border rounded w-full" required />
                        <select name="item" value={formState.item || fruitBowlTypes[0]} onChange={handleFormChange} className="p-2 border rounded w-full">{fruitBowlTypes.map(b => <option key={b} value={b}>{b}</option>)}</select>
                        <select name="status" value={formState.status || 'Pending'} onChange={handleFormChange} className="p-2 border rounded w-full"><option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option></select>
                        <button type="submit" className="bg-green-500 text-white w-full py-2 rounded">Save Delivery</button>
                    </form>
                );
            case 'addPayment': case 'editPayment':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <select name="customer_id" value={formState.customer_id || ''} onChange={handleFormChange} className="p-2 border rounded w-full" required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <input type="number" name="amount" value={formState.amount || ''} onChange={handleFormChange} placeholder="Amount" className="p-2 border rounded w-full" required/>
                        <div><label className="text-sm">Due Date</label><input type="date" name="due_date" value={formState.due_date?.split('T')[0] || ''} onChange={handleFormChange} className="p-2 border rounded w-full"/></div>
                        <select name="status" value={formState.status || 'Due'} onChange={handleFormChange} className="p-2 border rounded w-full"><option>Due</option><option>Paid</option><option>Overdue</option></select>
                        <button type="submit" className="bg-orange-500 text-white w-full py-2 rounded">Save Payment</button>
                    </form>
                );
            default: return null;
        }
    };
  
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        {isModalOpen && <Modal title={modalType.includes('edit') ? 'Edit Details' : 'Add New'} onClose={() => setIsModalOpen(false)}>{renderModalContent()}</Modal>}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Logout</button>
            </div>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
            <TabButton label="Deliveries" isActive={activeTab === 'deliveries'} onClick={() => setActiveTab('deliveries')} />
            <TabButton label="Customers" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
            <TabButton label="Agents" isActive={activeTab === 'agents'} onClick={() => setActiveTab('agents')} />
            <TabButton label="Payments" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
            <TabButton label="Support" isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} />
            <TabButton label="Password Requests" isActive={activeTab === 'password_requests'} onClick={() => setActiveTab('password_requests')} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
            <div className="overflow-x-auto">
                {activeTab === 'deliveries' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by customer or agent..." />
                    <button onClick={() => openModal('createDelivery')} className="bg-green-500 text-white py-2 px-4 rounded mb-4">+ Create Delivery</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Customer</th><th className="text-left p-2">Agent</th><th className="text-left p-2">Date</th><th className="text-left p-2">Status</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredDeliveries.map(d => (<tr key={d.id} className="border-b"><td className="p-2">{d.customer?.name}</td><td className="p-2">{d.agent?.name}</td><td className="p-2">{new Date(d.delivery_date).toLocaleDateString()}</td><td className="p-2"><StatusPill status={d.status} /></td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editDelivery', d)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeleteDelivery(d.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></>
                )}
                {activeTab === 'customers' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by name or mobile..." />
                    <button onClick={() => openModal('addCustomer')} className="bg-orange-500 text-white py-2 px-4 rounded mb-4">+ Add Customer</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Name</th><th className="text-left p-2">Address</th><th className="text-left p-2">Email</th><th className="text-left p-2">Mobile</th><th className="text-left p-2">First Purchase</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredCustomers.map(c => (<tr key={c.id} className="border-b"><td className="p-2">{c.name}</td><td className="p-2">{c.address}</td><td className="p-2">{c.email}</td><td className="p-2">{c.mobile}</td><td className="p-2">{new Date(c.first_purchase_date).toLocaleDateString()}</td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editCustomer', c)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeleteCustomer(c.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></>
                )}
                {activeTab === 'agents' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by name or email..." />
                    <button onClick={() => openModal('addAgent')} className="bg-orange-500 text-white py-2 px-4 rounded mb-4">+ Add Agent</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Name</th><th className="text-left p-2">Email</th><th className="text-left p-2">Mobile</th><th className="text-left p-2">Joined Date</th><th className="text-left p-2">Salary Status</th><th className="text-left p-2">Bank Details</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredAgents.map(a => (<tr key={a.id} className="border-b"><td className="p-2">{a.name}</td><td className="p-2">{a.email}</td><td className="p-2">{a.mobile}</td><td className="p-2">{new Date(a.join_date).toLocaleDateString()}</td><td className="p-2"><StatusPill status={a.salary_status} /></td><td className="p-2">{a.bank_details}</td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editAgent', a)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeleteAgent(a.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></>
                )}
                {activeTab === 'payments' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by customer name..." />
                    <button onClick={() => openModal('addPayment')} className="bg-orange-500 text-white py-2 px-4 rounded mb-4">+ Add Payment</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Customer</th><th className="text-left p-2">Amount</th><th className="text-left p-2">Status</th><th className="text-left p-2">Due Date</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredPayments.map(p => (<tr key={p.id} className="border-b"><td className="p-2">{p.customer?.name}</td><td className="p-2">${p.amount}</td><td className="p-2"><StatusPill status={p.status} /></td><td className="p-2">{new Date(p.due_date).toLocaleDateString()}</td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editPayment', p)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeletePayment(p.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></>
                )}
                 {activeTab === 'support' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by agent name..." />
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Agent</th><th className="text-left p-2">Issue Type</th><th className="text-left p-2">Details</th><th className="text-left p-2">Status</th><th className="text-left p-2">Date</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredSupportTickets.map(t => (<tr key={t.id} className="border-b"><td className="p-2">{t.agent?.name}</td><td className="p-2">{t.issueType}</td><td className="p-2">{t.details}</td><td className="p-2"><StatusPill status={t.status} /></td><td className="p-2">{new Date(t.createdAt).toLocaleString()}</td><td className="p-2">{t.status === 'Open' && <button onClick={() => onResolveTicket(t.id)} className="text-green-600 hover:underline">Resolve</button>}</td></tr>))}</tbody></table></>
                )}
                {activeTab === 'password_requests' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by agent name..." />
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Agent</th><th className="text-left p-2">Status</th><th className="text-left p-2">Date</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredPasswordRequests.map(r => (<tr key={r.id} className="border-b"><td className="p-2">{r.agent?.name}</td><td className="p-2"><StatusPill status={r.status} /></td><td className="p-2">{new Date(r.createdAt).toLocaleString()}</td><td className="p-2">{r.status === 'Pending' && <button onClick={() => onApprovePassword(r.id)} className="text-green-600 hover:underline">Approve</button>}</td></tr>))}</tbody></table></>
                )}
            </div>
        </div>
      </div>
    );
}

// --- Agent Portal Component ---
function AgentPortal({ agent, allDeliveries, allCustomers, onLogout, onUpdateDelivery, onReportIssue, onRequestPasswordChange }) {
    const [activeTab, setActiveTab] = useState('deliveries');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [issueType, setIssueType] = useState('Incorrect Address');
    const [issueDetails, setIssueDetails] = useState('');

    const agentDetails = useMemo(() => {
        const fullDetails = allCustomers.find(c => c.id === agent.id);
        return { ...agent, ...fullDetails };
    }, [agent, allCustomers]);


    const agentDeliveries = useMemo(() => allDeliveries.filter(d => d.agent_id === agent.id), [allDeliveries, agent.id]);

    const todaysDeliveries = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return agentDeliveries.filter(d => d.delivery_date.slice(0, 10) === today);
    }, [agentDeliveries]);

    const activeDeliveries = useMemo(() => 
        todaysDeliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit'), 
    [todaysDeliveries]);

    const historyDeliveries = useMemo(() => 
        agentDeliveries.filter(d => d.status === 'Delivered' || d.status === 'Failed' || d.status === 'Cancelled').sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date)),
    [agentDeliveries]);

    const stats = useMemo(() => ({
        total: todaysDeliveries.length,
        pending: activeDeliveries.length,
        completed: todaysDeliveries.filter(d => d.status === 'Delivered').length
    }), [todaysDeliveries, activeDeliveries]);

    const openStatusModal = (delivery) => {
        setSelectedDelivery(delivery);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = (newStatus) => {
        if (selectedDelivery) {
            onUpdateDelivery({ ...selectedDelivery, status: newStatus });
        }
        setIsModalOpen(false);
    };

    const handleReportSubmit = (e) => {
        e.preventDefault();
        onReportIssue({ issueType, details: issueDetails });
        setIssueDetails('');
        alert('Support ticket submitted successfully!');
    };
    
    const handleSaveChanges = () => {
        if (newPassword) {
            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }
            onRequestPasswordChange(newPassword);
            setNewPassword('');
            alert('Password change requested. An admin will approve it shortly.');
        }
    };

    const BottomNavLink = ({ page, label, icon }) => (
        <button onClick={() => setActiveTab(page)} className={`flex flex-col items-center justify-center w-full transition-colors py-1 ${activeTab === page ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
    
    const PageHeader = () => {
        let title = 'Deliveries';
        if (activeTab === 'history') title = 'History';
        if (activeTab === 'profile') title = 'Profile';
        if (activeTab === 'support') title = 'Support';

        return (
             <header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 p-4">
                 <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-orange-400">{title}</h1>
                    <button className="p-2 rounded-full text-gray-400 hover:bg-slate-800">
                       <span className="text-xl">⚙️</span>
                    </button>
                </div>
            </header>
        );
    };

    const renderPageContent = () => {
        switch(activeTab) {
            case 'history':
                return (
                    <div className="p-4 space-y-2">
                        <h2 className="text-xl font-bold text-gray-200">Delivery History</h2>
                        {historyDeliveries.length > 0 ? historyDeliveries.map(delivery => {
                            const customer = allCustomers.find(c => c.id === delivery.customer_id);
                            return (
                                <div key={delivery.id} className="bg-slate-800 p-4 rounded-xl border-b border-slate-700/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-lg text-white">{customer?.name || 'N/A'}</h4>
                                            <p className="text-sm text-gray-400">{customer?.address || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Completed: {new Date(delivery.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <StatusPill status={delivery.status} />
                                    </div>
                                </div>
                            );
                        }) : <div className="text-center text-gray-500 mt-8 p-10 bg-slate-800 rounded-xl">No past deliveries found.</div>}
                    </div>
                );
            case 'profile':
                return (
                    <div className="p-4">
                        <h2 className="text-xl font-bold text-gray-200 mb-4">Profile & Settings</h2>
                        <div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-2xl mx-auto">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold">
                                    {agent.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                                    <p className="text-gray-400">{agent.email}</p>
                                    <p className="text-gray-400">{agentDetails.mobile || '+1 (555) 123-4567'}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Update Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password" 
                                        className="mt-1 block w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-300">Notifications</span>
                                    <label htmlFor="notifications-toggle" className="inline-flex relative items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={notificationsEnabled}
                                            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                            id="notifications-toggle" 
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                                <button onClick={handleSaveChanges} className="w-full bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Save Changes</button>
                            </div>
                        </div>
                    </div>
                );
            case 'support':
                return (
                    <div className="p-4">
                        <h2 className="text-xl font-bold text-gray-200 mb-4">Support</h2>
                        <div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-2xl mx-auto space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Contact Admin</h3>
                                <div className="flex gap-4">
                                    <button className="flex-1 flex items-center justify-center gap-2 border border-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                                        <span>📞</span> Call Support
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                                        <span>💬</span> Chat with Admin
                                    </button>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Report an Issue</h3>
                                <form onSubmit={handleReportSubmit} className="space-y-4">
                                    <select value={issueType} onChange={e => setIssueType(e.target.value)} className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                                        <option>Incorrect Address</option>
                                        <option>Customer Not Available</option>
                                        <option>Package Damaged</option>
                                        <option>Vehicle Issue</option>
                                        <option>Other</option>
                                    </select>
                                    <textarea value={issueDetails} onChange={e => setIssueDetails(e.target.value)} rows="4" className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Provide more details..."></textarea>
                                    <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">Submit Report</button>
                                </form>
                            </div>
                        </div>
                    </div>
                );
            case 'deliveries':
            default:
                return (
                    <div className="p-4">
                        <div className="bg-slate-800 p-4 rounded-xl mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Welcome, {agent.name}!</h2>
                                    <p className="text-gray-400">Here's your summary for today.</p>
                                </div>
                                <button onClick={onLogout} className="p-2 rounded-full text-gray-400 hover:bg-slate-700">
                                   <span className="text-2xl">→</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800 p-4 rounded-xl text-center">
                                <p className="text-gray-400 text-sm font-medium">Today's</p>
                                <p className="text-3xl font-bold text-white">{stats.total}</p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl text-center">
                                <p className="text-gray-400 text-sm font-medium">Pending</p>
                                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl text-center">
                                <p className="text-gray-400 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-gray-300 px-4">Active Deliveries</h3>
                        <div className="space-y-4">
                            {activeDeliveries.length > 0 ? activeDeliveries.map(delivery => {
                                const customer = allCustomers.find(c => c.id === delivery.customer_id);
                                return (
                                    <div key={delivery.id} className="bg-slate-800 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg text-white">{customer?.name || 'N/A'}</h4>
                                                <p className="text-sm text-gray-400">{customer?.address || 'N/A'}</p>
                                            </div>
                                            <StatusPill status={delivery.status} />
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2">
                                                <span>⎋</span> Navigate
                                            </button>
                                            <button onClick={() => openStatusModal(delivery)} className="flex-1 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center gap-2">
                                                <span>✎</span> Update Status
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-center text-gray-500 mt-8 py-10 bg-slate-800 rounded-xl">No active deliveries for today.</p>}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-gray-300">
            {isModalOpen && (
                <Modal title="Update Delivery Status" onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-4 text-white">
                        <p>Update status for <strong>{allCustomers.find(c => c.id === selectedDelivery.customer_id)?.name}</strong>:</p>
                        <div className="flex flex-col sm:flex-row justify-around gap-3">
                            <button onClick={() => handleStatusUpdate('In Transit')} className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold">In Transit</button>
                            <button onClick={() => handleStatusUpdate('Delivered')} className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold">Delivered</button>
                            <button onClick={() => handleStatusUpdate('Failed')} className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold">Failed</button>
                        </div>
                    </div>
                </Modal>
            )}
            
            <main className="pb-20">
                <PageHeader />
                {renderPageContent()}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 flex justify-around z-20">
                <BottomNavLink page="deliveries" label="Deliveries" icon="📦" />
                <BottomNavLink page="history" label="History" icon="🕒" />
                <BottomNavLink page="profile" label="Profile" icon="👤" />
                <BottomNavLink page="support" label="Support" icon="💡" />
            </nav>
        </div>
    );
}


// --- Main App Component (Root) ---
export default function App() {
    const [page, setPage] = useState('auth');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
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
        setPage('auth');
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
            if (!customersRes.ok || !agentsRes.ok || !deliveriesRes.ok || !paymentsRes.ok || !supportRes.ok || !passwordRes.ok) {
                throw new Error("Failed to fetch initial data. Your session may have expired.");
            }
            setCustomers(await customersRes.json());
            setAgents(await agentsRes.json());
            setDeliveries(await deliveriesRes.json());
            setPayments(await paymentsRes.json());
            setSupportTickets(await supportRes.json());
            setPasswordRequests(await passwordRes.json());
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
                setPage(parsedUser.role === 'Admin' ? 'admin_dashboard' : 'agent_portal');
            } catch (e) {
                handleLogout();
            }
        } else {
            setLoggedInUser(null);
            setPage('auth');
        }
    }, [token, handleLogout]);

    useEffect(() => {
        if (loggedInUser) {
            fetchData(token);
        }
    }, [loggedInUser, token, fetchData]);

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

    const handleRegister = async (name, email, password, adminCode) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, adminCode, role: 'Admin' })
        });
        await handleApiError(res);
    };

    const handleLogin = async (email, password, userType) => {
        const loginUrl = userType === 'admin' ? `${API_URL}/auth/login` : `${API_URL}/agents/login`;
        const res = await fetch(loginUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        await handleApiError(res);
        const { token: newToken, user } = await res.json();
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(newToken);
    };

    const apiRequest = async (endpoint, method, body = null) => {
        try {
            const authHeader = { 'Authorization': `Bearer ${token}` };
            const options = { method, headers: { ...authHeader, 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(`${API_URL}${endpoint}`, options);
            await handleApiError(res);
            fetchData(token);
        } catch (error) {
            console.error(`API request to ${endpoint} failed:`, error);
            alert(`Error: ${error.message}`);
        }
    };
  
    const requestConfirmation = (title, message, onConfirm) => {
        setConfirmState({ isOpen: true, title, message, onConfirm });
    };

    const handleConfirm = () => {
        if (confirmState.onConfirm) {
            confirmState.onConfirm();
        }
        setConfirmState({ isOpen: false });
    };
  
    const handleCancelConfirm = () => {
        setConfirmState({ isOpen: false });
    };

    const handleAddCustomer = (customer) => apiRequest('/customers', 'POST', customer);
    const handleUpdateCustomer = (customer) => apiRequest(`/customers/${customer.id}`, 'PUT', customer);
    const handleDeleteCustomer = (id) => requestConfirmation('Delete Customer?', 'Are you sure you want to delete this customer? This action cannot be undone.', () => apiRequest(`/customers/${id}`, 'DELETE'));

    const handleAddAgent = (agent) => apiRequest('/agents', 'POST', agent);
    const handleUpdateAgent = (agent) => apiRequest(`/agents/${agent.id}`, 'PUT', agent);
    const handleDeleteAgent = (id) => requestConfirmation('Delete Agent?', 'Are you sure you want to delete this agent?', () => apiRequest(`/agents/${id}`, 'DELETE'));

    const handleCreateDelivery = (delivery) => apiRequest('/deliveries', 'POST', delivery);
    const handleUpdateDelivery = (delivery) => apiRequest(`/deliveries/${delivery.id}`, 'PUT', delivery);
    const handleDeleteDelivery = (id) => requestConfirmation('Delete Delivery?', 'Are you sure you want to delete this delivery record?', () => apiRequest(`/deliveries/${id}`, 'DELETE'));
  
    const handleAddPayment = (payment) => apiRequest('/payments', 'POST', payment);
    const handleUpdatePayment = (payment) => apiRequest(`/payments/${payment.id}`, 'PUT', payment);
    const handleDeletePayment = (id) => requestConfirmation('Delete Payment?', 'Are you sure you want to delete this payment record?', () => apiRequest(`/payments/${id}`, 'DELETE'));
    
    const handleReportIssue = (issue) => apiRequest('/support', 'POST', issue);
    const handleResolveTicket = (ticketId) => apiRequest(`/support/${ticketId}`, 'PUT', { status: 'Resolved' });
    const handleRequestPasswordChange = (newPassword) => apiRequest('/password-requests', 'POST', { newPassword });
    const handleApprovePassword = (requestId) => apiRequest(`/password-requests/${requestId}/approve`, 'PUT');

    const renderPage = () => {
        switch (page) {
            case 'admin_dashboard':
                return <AdminDashboard onLogout={handleLogout} customers={customers} agents={agents} deliveries={deliveries} payments={payments} supportTickets={supportTickets} passwordRequests={passwordRequests} onAddCustomer={handleAddCustomer} onAddAgent={handleAddAgent} onCreateDelivery={handleCreateDelivery} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} onUpdateAgent={handleUpdateAgent} onDeleteAgent={handleDeleteAgent} onUpdateDelivery={handleUpdateDelivery} onDeleteDelivery={handleDeleteDelivery} onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment} onResolveTicket={handleResolveTicket} onApprovePassword={handleApprovePassword} />;
            case 'agent_portal':
                return <AgentPortal agent={loggedInUser} allDeliveries={deliveries} allCustomers={agents} onLogout={handleLogout} onUpdateDelivery={handleUpdateDelivery} onReportIssue={handleReportIssue} onRequestPasswordChange={handleRequestPasswordChange} />;
            case 'auth':
            default:
                return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
        }
    }

    return (
        <>
            {confirmState.isOpen && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancelConfirm} />}
            {renderPage()}
        </>
    );
}
