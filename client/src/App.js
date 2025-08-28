import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import axios from 'axios'; // Using axios for more robust API requests

// --- Import Portal Components ---
import AdminPortal from './portals/AdminPortal';
import AgentPortal from './portals/AgentPortal';
import AuthPage from './portals/AuthPage';

// --- Import Page Components ---
import LandingPage from './components/LandingPage';
import CustomerPortal from './components/CustomerDashboard';

// --- Configuration ---
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// --- Reusable UI Components (from your existing code) ---
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
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </>,
        document.body
    );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <Modal title={title} onClose={onCancel}>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Confirm</button></div>
    </Modal>
);


// --- Main App Component (Root) ---
export default function App() {
    // --- STATE MANAGEMENT (from your existing code) ---
    const [view, setView] = useState('landing_page');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [initialAuthType, setInitialAuthType] = useState('customer');
    
    // --- DATA STATES (from your existing code) ---
    const [customers, setCustomers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [payments, setPayments] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [passwordRequests, setPasswordRequests] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [confirmState, setConfirmState] = useState({ isOpen: false });

    // --- API & AUTH HELPERS ---
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoggedInUser(null);
        setView('landing_page');
    }, []);
  
    // --- ENHANCED DATA FETCHING ---
    const fetchData = useCallback(async (endpoint, setter) => {
        try {
            const response = await axios.get(`${API_URL}/${endpoint}`, { headers: getAuthHeaders() });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        }
    }, [handleLogout]);

    // Fetch initial data when the logged-in user changes
    useEffect(() => {
        const fetchAllData = () => {
            fetchData('products', setProducts);
            fetchData('products/categories', setCategories);
            fetchData('subscriptions/plans', setSubscriptionPlans);

            if (loggedInUser) {
                if (loggedInUser.role === 'Admin') {
                    fetchData('customers', setCustomers);
                    fetchData('agents', setAgents);
                    fetchData('deliveries', setDeliveries);
                    fetchData('payments', setPayments);
                    fetchData('support', setSupportTickets);
                    fetchData('password-requests', setPasswordRequests);
                    fetchData('orders', setOrders); // Also fetch orders for admin view
                } else if (loggedInUser.role === 'Customer') {
                    fetchData('orders', setOrders);
                    fetchData('subscriptions/my-subscriptions', setActiveSubscriptions);
                }
            }
        };
        fetchAllData();
    }, [loggedInUser, fetchData]);

    // --- REAL-TIME DATA SYNCHRONIZATION (ENHANCED) ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(SOCKET_URL);
        const eventMap = {
            'deliveries_updated': () => fetchData('deliveries', setDeliveries),
            'support_tickets_updated': () => fetchData('support', setSupportTickets),
            'password_requests_updated': () => fetchData('password-requests', setPasswordRequests),
            'customers_updated': () => fetchData('customers', setCustomers),
            'agents_updated': () => fetchData('agents', setAgents),
            'payments_updated': () => fetchData('payments', setPayments),
            'products_updated': () => fetchData('products', setProducts),
            'categories_updated': () => fetchData('products/categories', setCategories),
            'orders_updated': () => fetchData('orders', setOrders),
            'subscription_plans_updated': () => fetchData('subscriptions/plans', setSubscriptionPlans),
            'subscriptions_updated': () => fetchData('subscriptions/my-subscriptions', setActiveSubscriptions),
        };

        Object.keys(eventMap).forEach(event => socket.on(event, eventMap[event]));

        return () => {
            Object.keys(eventMap).forEach(event => socket.off(event));
            socket.disconnect();
        };
    }, [fetchData]);

    // --- GENERIC CRUD HANDLERS ---
    const createResource = async (resource, data) => {
        try {
            await axios.post(`${API_URL}/${resource}`, data, { headers: getAuthHeaders() });
        } catch (error) {
            console.error(`Error creating ${resource}:`, error);
            alert(`Error: ${error.response?.data?.message || 'Could not create item.'}`);
        }
    };

    const updateResource = async (resource, id, data) => {
        try {
            await axios.put(`${API_URL}/${resource}/${id}`, data, { headers: getAuthHeaders() });
        } catch (error) {
            console.error(`Error updating ${resource}:`, error);
            alert(`Error: ${error.response?.data?.message || 'Could not update item.'}`);
        }
    };

    const deleteResource = (resource, id) => {
        setConfirmState({
            isOpen: true,
            title: `Delete ${resource}?`,
            message: 'Are you sure? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_URL}/${resource}/${id}`, { headers: getAuthHeaders() });
                    setConfirmState({ isOpen: false });
                } catch (error) {
                    console.error(`Error deleting ${resource}:`, error);
                    alert(`Error: ${error.response?.data?.message || 'Could not delete item.'}`);
                    setConfirmState({ isOpen: false });
                }
            }
        });
    };

    // --- AUTHENTICATION LOGIC (from your existing code) ---
    const handleLogin = (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setLoggedInUser(user);
        switch (user.role) {
            case 'Admin': setView('admin_portal'); break;
            case 'Agent': setView('agent_portal'); break;
            case 'Customer': setView('customer_portal'); break;
            default: setView('landing_page');
        }
    };

    // Check for existing token on app load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            try {
                handleLogin(JSON.parse(user), token);
            } catch (e) { handleLogout(); }
        }
    }, [handleLogout]);

    const handlePortalLinkClick = (userType) => {
        setInitialAuthType(userType);
        setView('auth');
    };

    // --- VIEW RENDERING ---
    const renderView = () => {
        switch (view) {
            case 'admin_portal':
                return <AdminPortal 
                            onLogout={handleLogout} 
                            allCustomers={customers} 
                            allAgents={agents} 
                            allDeliveries={deliveries} 
                            allPayments={payments} 
                            allSupportTickets={supportTickets} 
                            allPasswordRequests={passwordRequests} 
                            allProducts={products} 
                            allCategories={categories} 
                            allOrders={orders} 
                            allSubscriptionPlans={subscriptionPlans}
                            onCreate={createResource}
                            onUpdate={updateResource}
                            onDelete={deleteResource}
                            ModalComponent={Modal}
                        />;
            case 'agent_portal':
                return <AgentPortal 
                            agent={loggedInUser} 
                            allDeliveries={deliveries} 
                            allCustomers={customers} 
                            onLogout={handleLogout} 
                            onUpdateDelivery={(delivery) => updateResource('deliveries', delivery.id, delivery)}
                            ModalComponent={Modal}
                        />;
            case 'auth':
                return <AuthPage onLogin={handleLogin} onBack={() => setView('landing_page')} initialUserType={initialAuthType} />;
            case 'customer_portal':
                return <CustomerPortal 
                            user={loggedInUser} 
                            onLogout={handleLogout}
                            products={products}
                            categories={categories}
                            subscriptionPlans={subscriptionPlans}
                            activeSubscriptions={activeSubscriptions}
                            orders={orders}
                        />;
            case 'landing_page':
            default:
                return <LandingPage onAuthClick={() => { setInitialAuthType('customer'); setView('auth'); }} onPortalLinkClick={handlePortalLinkClick} />;
        }
    }

    return (
        <>
            {confirmState.isOpen && <ConfirmModal {...confirmState} onCancel={() => setConfirmState({ isOpen: false })} />}
            {renderView()}
        </>
    );
}
