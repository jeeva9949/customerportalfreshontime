import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Define the backend API URL
const API_URL = 'http://localhost:5000/api';

// --- Reusable Components ---
const StatusPill = ({ status }) => {
    const statusClasses = {
        Pending: 'bg-yellow-100 text-yellow-800', 'In Transit': 'bg-blue-100 text-blue-800',
        Delivered: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800',
        Paid: 'bg-green-100 text-green-800', Unpaid: 'bg-red-100 text-red-800',
        Due: 'bg-yellow-100 text-yellow-800'
    };
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status || 'N/A'}</span>;
};
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">{title}</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div>
            {children}
        </div>
    </div>
);
const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{label}</button>
);
const SearchBar = ({ onSearch, placeholder }) => (
    <input type="text" onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className="p-2 border rounded w-full md:w-1/3 mb-4" />
);


// --- Auth Pages ---
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
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{isLogin ? `${userType.charAt(0).toUpperCase() + userType.slice(1)} Login` : 'Admin Registration'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="p-2 border rounded w-full mb-4" required />
                            <input type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Admin Registration Code" className="p-2 border rounded w-full mb-4" required />
                        </>
                    )}
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded w-full mb-4" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="p-2 border rounded w-full mb-4" required />
                    {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                    <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">{isLogin ? 'Sign In' : 'Register'}</button>
                </form>
            </div>
            <div className="text-center mt-4">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); if(!isLogin) setUserType('admin'); }} className="text-blue-600 hover:underline">
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

// --- Admin Dashboard ---
function AdminDashboard({ onLogout, customers, agents, deliveries, payments, onAddCustomer, onAddAgent, onCreateDelivery, onUpdateCustomer, onDeleteCustomer, onUpdateAgent, onDeleteAgent, onUpdateDelivery, onDeleteDelivery, onStartNewDay, onAddPayment, onUpdatePayment, onDeletePayment }) {
    const [activeTab, setActiveTab] = useState('deliveries');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formState, setFormState] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
  
    const openModal = (type, item = null) => {
        setModalType(type);
        if (item) { 
            if (type === 'editDelivery') {
                setFormState({ ...item, customerId: item.customer_id, agentId: item.agent_id });
            } else {
                setFormState(item);
            }
        } 
        else {
            const defaultState = {
                addCustomer: { name: '', address: '', mobile: '', email: '', first_purchase_date: new Date().toISOString().split('T')[0] },
                addAgent: { name: '', mobile: '', email: '', password: '', join_date: new Date().toISOString().split('T')[0], salary_status: 'Unpaid', bank_details: '' },
                createDelivery: { customerId: '', agentId: '', item: 'Tropical Fruit Bowl', delivery_date: new Date().toISOString().split('T')[0], status: 'Pending' },
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
        if (modalType === 'createDelivery' || modalType === 'editDelivery') {
            const payload = { ...formState, customer_id: formState.customerId, agent_id: formState.agentId };
            delete payload.customerId;
            delete payload.agentId;
            if (modalType === 'createDelivery') onCreateDelivery(payload);
            else onUpdateDelivery(payload);
        } else {
            switch (modalType) {
                case 'addCustomer': onAddCustomer(formState); break;
                case 'addAgent': onAddAgent(formState); break;
                case 'addPayment': onAddPayment(formState); break;
                case 'editCustomer': onUpdateCustomer(formState); break;
                case 'editAgent': onUpdateAgent(formState); break;
                case 'editPayment': onUpdatePayment(formState); break;
                default: break;
            }
        }
        setIsModalOpen(false);
    };

    const filteredDeliveries = useMemo(() => deliveries.filter(d => {
        const customer = customers.find(c => c.id === d.customer_id);
        const agent = agents.find(a => a.id === d.agent_id);
        const searchTermLower = searchTerm.toLowerCase();
        return (customer?.name.toLowerCase().includes(searchTermLower) || agent?.name.toLowerCase().includes(searchTermLower));
    }), [deliveries, customers, agents, searchTerm]);

    const filteredCustomers = useMemo(() => customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm)), [customers, searchTerm]);
    const filteredAgents = useMemo(() => agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase())), [agents, searchTerm]);
    const filteredPayments = useMemo(() => payments.filter(p => {
        const customer = customers.find(c => c.id === p.customer_id);
        return customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    }), [payments, customers, searchTerm]);
  
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
                        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">Save Customer</button>
                    </form>
                );
            case 'addAgent': case 'editAgent':
                 return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="name" value={formState.name || ''} onChange={handleFormChange} placeholder="Agent Name" className="p-2 border rounded w-full" required/>
                        <input type="email" name="email" value={formState.email || ''} onChange={handleFormChange} placeholder="Login Email" className="p-2 border rounded w-full" required/>
                        <input name="mobile" value={formState.mobile || ''} onChange={handleFormChange} placeholder="Mobile" className="p-2 border rounded w-full" required/>
                        <input type="password" name="password" value={formState.password || ''} onChange={handleFormChange} placeholder="Login Password" className="p-2 border rounded w-full" required={modalType === 'addAgent'}/>
                        <textarea name="bank_details" value={formState.bank_details || ''} onChange={handleFormChange} placeholder="Bank Details (Account #, IFSC)" className="p-2 border rounded w-full"/>
                        <div><label className="text-sm">Joined Date</label><input type="date" name="join_date" value={formState.join_date?.split('T')[0] || ''} onChange={handleFormChange} className="p-2 border rounded w-full"/></div>
                        <div><label className="text-sm">Salary Status</label><select name="salary_status" value={formState.salary_status || 'Unpaid'} onChange={handleFormChange} className="p-2 border rounded w-full"><option>Unpaid</option><option>Paid</option></select></div>
                        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">Save Agent</button>
                    </form>
                );
            case 'createDelivery': case 'editDelivery':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <select name="customerId" value={formState.customerId || ''} onChange={handleFormChange} className="p-2 border rounded w-full" required><option value="">Select Customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <select name="agentId" value={formState.agentId || ''} onChange={handleFormChange} className="p-2 border rounded w-full" required><option value="">Assign to Agent</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
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
                        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">Save Payment</button>
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
                <button onClick={onStartNewDay} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg mr-4">Start New Day</button>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Logout</button>
            </div>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap"><TabButton label="Deliveries" isActive={activeTab === 'deliveries'} onClick={() => setActiveTab('deliveries')} /><TabButton label="Customers" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} /><TabButton label="Agents" isActive={activeTab === 'agents'} onClick={() => setActiveTab('agents')} /><TabButton label="Payments" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} /></div>
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
            <div className="overflow-x-auto">
                {activeTab === 'deliveries' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by customer or agent..." />
                    <button onClick={() => openModal('createDelivery')} className="bg-green-500 text-white py-2 px-4 rounded mb-4">+ Create Delivery</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Customer</th><th className="text-left p-2">Agent</th><th className="text-left p-2">Date</th><th className="text-left p-2">Status</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredDeliveries.map(d => {const c = customers.find(c => c.id === d.customer_id); const a = agents.find(a => a.id === d.agent_id); return (<tr key={d.id} className="border-b"><td className="p-2">{c?.name}</td><td className="p-2">{a?.name}</td><td className="p-2">{new Date(d.delivery_date).toLocaleDateString()}</td><td className="p-2"><StatusPill status={d.status} /></td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editDelivery', d)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeleteDelivery(d.id)} className="text-red-600">Delete</button></td></tr>);})}</tbody></table></>
                )}
                {activeTab === 'customers' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by name or mobile..." />
                    <button onClick={() => openModal('addCustomer')} className="bg-blue-600 text-white py-2 px-4 rounded mb-4">+ Add Customer</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Name</th><th className="text-left p-2">Address</th><th className="text-left p-2">Email</th><th className="text-left p-2">Mobile</th><th className="text-left p-2">First Purchase</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredCustomers.map(c => (<tr key={c.id} className="border-b"><td className="p-2">{c.name}</td><td className="p-2">{c.address}</td><td className="p-2">{c.email}</td><td className="p-2">{c.mobile}</td><td className="p-2">{new Date(c.first_purchase_date).toLocaleDateString()}</td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editCustomer', c)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeleteCustomer(c.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></>
                )}
                {activeTab === 'agents' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by name or email..." />
                    <button onClick={() => openModal('addAgent')} className="bg-blue-600 text-white py-2 px-4 rounded mb-4">+ Add Agent</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Name</th><th className="text-left p-2">Email</th><th className="text-left p-2">Mobile</th><th className="text-left p-2">Joined Date</th><th className="text-left p-2">Salary Status</th><th className="text-left p-2">Bank Details</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredAgents.map(a => (<tr key={a.id} className="border-b"><td className="p-2">{a.name}</td><td className="p-2">{a.email}</td><td className="p-2">{a.mobile}</td><td className="p-2">{new Date(a.join_date).toLocaleDateString()}</td><td className="p-2"><StatusPill status={a.salary_status} /></td><td className="p-2">{a.bank_details}</td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editAgent', a)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeleteAgent(a.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></>
                )}
                {activeTab === 'payments' && (
                    <><SearchBar onSearch={setSearchTerm} placeholder="Search by customer name..." />
                    <button onClick={() => openModal('addPayment')} className="bg-blue-600 text-white py-2 px-4 rounded mb-4">+ Add Payment</button>
                    <table className="min-w-full"><thead><tr><th className="text-left p-2">Customer</th><th className="text-left p-2">Amount</th><th className="text-left p-2">Status</th><th className="text-left p-2">Due Date</th><th className="text-left p-2">Actions</th></tr></thead>
                    <tbody>{filteredPayments.map(p => {const c = customers.find(c => c.id === p.customer_id); return (<tr key={p.id} className="border-b"><td className="p-2">{c?.name}</td><td className="p-2">${p.amount}</td><td className="p-2"><StatusPill status={p.status} /></td><td className="p-2">{new Date(p.due_date).toLocaleDateString()}</td><td className="p-2 whitespace-nowrap"><button onClick={() => openModal('editPayment', p)} className="text-indigo-600 mr-2">Edit</button><button onClick={() => onDeletePayment(p.id)} className="text-red-600">Delete</button></td></tr>);})}</tbody></table></>
                )}
            </div>
        </div>
      </div>
    );
}

// --- Agent Portal ---
function AgentPortal({ agent, onLogout, onUpdateDelivery }) {
    const [deliveries, setDeliveries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const token = localStorage.getItem('token');
    
    const fetchData = useCallback(async () => {
        if (!token || !agent) return;
        const authHeader = { 'Authorization': `Bearer ${token}` };
        const [deliveriesRes, customersRes] = await Promise.all([
            fetch(`${API_URL}/deliveries`, { headers: authHeader }),
            fetch(`${API_URL}/customers`, { headers: authHeader })
        ]);
        const allDeliveries = await deliveriesRes.json();
        setCustomers(await customersRes.json());
        setDeliveries(allDeliveries.filter(d => d.agent_id === agent.id));
    }, [agent, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = (delivery, newStatus) => {
        onUpdateDelivery({ ...delivery, status: newStatus });
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {isModalOpen && selectedDelivery && (
                <Modal title="Update Delivery Status" onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-4">
                        <p>Update status for <strong>{customers.find(c => c.id === selectedDelivery.customer_id)?.name}</strong>:</p>
                        <div className="flex justify-around">
                            <button onClick={() => handleStatusUpdate(selectedDelivery, 'In Transit')} className="bg-blue-500 text-white px-4 py-2 rounded">In Transit</button>
                            <button onClick={() => handleStatusUpdate(selectedDelivery, 'Delivered')} className="bg-green-500 text-white px-4 py-2 rounded">Delivered</button>
                        </div>
                    </div>
                </Modal>
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {agent.name}</h1>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Logout</button>
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Assigned Deliveries</h2>
            <div className="space-y-4">
                {deliveries.length > 0 ? deliveries.map(delivery => {
                    const customer = customers.find(c => c.id === delivery.customer_id);
                    return (
                        <div key={delivery.id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg">{customer?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{customer?.address || 'N/A'}</p>
                                </div>
                                <StatusPill status={delivery.status} />
                            </div>
                            <div className="mt-4">
                                <button onClick={() => { setSelectedDelivery(delivery); setIsModalOpen(true); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700">Update Status</button>
                            </div>
                        </div>
                    )
                }) : <p>You have no assigned deliveries.</p>}
            </div>
        </div>
    );
}


// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('auth');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]);

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
        const [customersRes, agentsRes, deliveriesRes, paymentsRes] = await Promise.all([
            fetch(`${API_URL}/customers`, { headers: authHeader }),
            fetch(`${API_URL}/agents`, { headers: authHeader }),
            fetch(`${API_URL}/deliveries`, { headers: authHeader }),
            fetch(`${API_URL}/payments`, { headers: authHeader })
        ]);
        if(!customersRes.ok || !agentsRes.ok || !deliveriesRes.ok || !paymentsRes.ok) throw new Error("Failed to fetch initial data");
        setCustomers(await customersRes.json());
        setAgents(await agentsRes.json());
        setDeliveries(await deliveriesRes.json());
        setPayments(await paymentsRes.json());
    } catch (error) {
        console.error("Fetch data error:", error);
        handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (token && userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      setLoggedInUser(parsedUser);
      setPage(parsedUser.role === 'Admin' ? 'admin_dashboard' : 'agent_portal');
    } else {
      setLoggedInUser(null);
      setPage('auth');
    }
  }, [token]);

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

  const handleAddCustomer = (customer) => apiRequest('/customers', 'POST', customer);
  const handleUpdateCustomer = (customer) => apiRequest(`/customers/${customer.id}`, 'PUT', customer);
  const handleDeleteCustomer = (id) => { if (window.confirm('Are you sure?')) apiRequest(`/customers/${id}`, 'DELETE'); };

  const handleAddAgent = (agent) => apiRequest('/agents', 'POST', agent);
  const handleUpdateAgent = (agent) => apiRequest(`/agents/${agent.id}`, 'PUT', agent);
  const handleDeleteAgent = (id) => { if (window.confirm('Are you sure?')) apiRequest(`/agents/${id}`, 'DELETE'); };

  const handleCreateDelivery = (delivery) => apiRequest('/deliveries', 'POST', delivery);
  const handleUpdateDelivery = (delivery) => apiRequest(`/deliveries/${delivery.id}`, 'PUT', delivery);
  const handleDeleteDelivery = (id) => { if (window.confirm('Are you sure?')) apiRequest(`/deliveries/${id}`, 'DELETE'); };
  
  const handleAddPayment = (payment) => apiRequest('/payments', 'POST', payment);
  const handleUpdatePayment = (payment) => apiRequest(`/payments/${payment.id}`, 'PUT', payment);
  const handleDeletePayment = (id) => { if (window.confirm('Are you sure?')) apiRequest(`/payments/${id}`, 'DELETE'); };

  const handleStartNewDay = async () => {
      if (window.confirm("Are you sure you want to start a new day? This will reset all 'Delivered' statuses to 'Pending'.")) {
          const delivered = deliveries.filter(d => d.status === 'Delivered');
          for (const delivery of delivered) {
              await handleUpdateDelivery({ ...delivery, status: 'Pending', delivery_date: new Date().toISOString() });
          }
          alert("New day started! Deliveries have been reset.");
      }
  };

  switch (page) {
    case 'admin_dashboard':
      return <AdminDashboard onLogout={handleLogout} customers={customers} agents={agents} deliveries={deliveries} payments={payments} onAddCustomer={handleAddCustomer} onAddAgent={handleAddAgent} onCreateDelivery={handleCreateDelivery} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} onUpdateAgent={handleUpdateAgent} onDeleteAgent={handleDeleteAgent} onUpdateDelivery={handleUpdateDelivery} onDeleteDelivery={handleDeleteDelivery} onStartNewDay={handleStartNewDay} onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment} />;
    case 'agent_portal':
      return <AgentPortal agent={loggedInUser} onLogout={handleLogout} onUpdateDelivery={handleUpdateDelivery} />;
    case 'auth':
    default:
      return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }
}
