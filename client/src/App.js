import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import axios from 'axios'; 

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

// --- Reusable UI Components ---
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
        <div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Confirm</button></div>
    </Modal>
);


// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('landing_page');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [initialAuthType, setInitialAuthType] = useState('customer');
    
    // --- Centralized Data State ---
    const [allCustomers, setAllCustomers] = useState([]);
    const [allAgents, setAllAgents] = useState([]);
    const [allDeliveries, setAllDeliveries] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [allSupportTickets, setAllSupportTickets] = useState([]);
    const [allPasswordRequests, setAllPasswordRequests] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [allSubscriptionPlans, setAllSubscriptionPlans] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [allSubscriptions, setAllSubscriptions] = useState([]);
    
    // Customer-specific state
    const [myActiveSubscriptions, setMyActiveSubscriptions] = useState([]);
    const [myOrders, setMyOrders] = useState([]);

    const [confirmState, setConfirmState] = useState({ isOpen: false });

    // --- Helper for API calls ---
    const getAuthHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token}`
    }), [token]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setLoggedInUser(null);
        setView('landing_page');
    }, []);
  
    // --- Unified Data Fetching Function ---
    const fetchData = useCallback(async () => {
        if (!token || !loggedInUser) return;
        
        const fetchResource = async (endpoint, setter) => {
            try {
                const res = await axios.get(`${API_URL}/${endpoint}`, { headers: getAuthHeaders() });
                setter(res.data);
            } catch (error) {
                console.error(`Failed to fetch ${endpoint}:`, error);
                if (error.response?.status === 401) handleLogout();
            }
        };

        // Fetch public data on every load
        fetchResource('products', setAllProducts);
        fetchResource('products/categories', setAllCategories);
        fetchResource('subscriptions/plans', setAllSubscriptionPlans);

        // Fetch role-specific data
        const { role } = loggedInUser;
        if (role === 'Admin') {
            await Promise.all([
                fetchResource('customers', setAllCustomers),
                fetchResource('agents', setAllAgents),
                fetchResource('deliveries', setAllDeliveries),
                fetchResource('payments', setAllPayments),
                fetchResource('support', setAllSupportTickets),
                fetchResource('password-requests', setAllPasswordRequests),
                fetchResource('orders', setAllOrders), // Correct admin route for all orders
                fetchResource('subscriptions/all', setAllSubscriptions),
            ]);
        } else if (role === 'Customer') {
             await Promise.all([
                fetchResource('orders', setMyOrders),
                fetchResource('subscriptions/my-subscriptions', setMyActiveSubscriptions)
            ]);
        } else if (role === 'Agent') {
            fetchResource('deliveries', setAllDeliveries); // Agents need all deliveries to find theirs
        }

    }, [token, loggedInUser, getAuthHeaders, handleLogout]);

    // --- Authentication and Initial Load ---
    useEffect(() => {
        const userFromStorage = localStorage.getItem('user');
        if (token && userFromStorage) {
            try {
                const parsedUser = JSON.parse(userFromStorage);
                setLoggedInUser(parsedUser);
                if (parsedUser.role === 'Admin') setView('admin_portal');
                else if (parsedUser.role === 'Agent') setView('agent_portal');
                else setView('customer_portal');
            } catch (e) { handleLogout(); }
        } else {
            setView('landing_page');
        }
    }, [token, handleLogout]);

    useEffect(() => {
        if (loggedInUser) {
            fetchData();
        }
    }, [loggedInUser, fetchData]);

    // --- Real-Time Updates via Socket.IO ---
    useEffect(() => {
        if (!token) return;
        const socket = io(SOCKET_URL);
        socket.on('connect', () => console.log('WebSocket Connected'));
        
        // When any data changes, just refetch everything.
        const handleUpdate = () => fetchData();
        
        const events = [
            'deliveries_updated', 'support_tickets_updated', 'password_requests_updated',
            'customers_updated', 'agents_updated', 'payments_updated', 'products_updated',
            'categories_updated', 'orders_updated', 'subscription_plans_updated', 'subscriptions_updated'
        ];
        
        events.forEach(event => socket.on(event, handleUpdate));
        
        return () => {
            events.forEach(event => socket.off(event, handleUpdate));
            socket.disconnect();
        };
    }, [token, fetchData]);

    // --- Authentication Handlers ---
    const handleLogin = async (email, password, userType) => {
        const endpoint = userType === 'admin' ? '/auth/login' : '/agents/login';
        try {
            const res = await axios.post(`${API_URL}${endpoint}`, { email, password });
            const { token: newToken, user } = res.data;
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(newToken);
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed');
        }
    };
    
    const handleCustomerAuth = async (authData, isLogin) => {
        const endpoint = isLogin ? '/customer-auth/login' : '/customer-auth/register';
        try {
            const res = await axios.post(`${API_URL}${endpoint}`, authData);
            if (isLogin) {
                const { token: newToken, user } = res.data;
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(user));
                setToken(newToken);
            } else {
                alert('Sign up successful! Please log in.');
            }
        } catch (error) {
             alert(error.response?.data?.message || 'Authentication failed');
        }
    };

    // --- Generic CRUD Handlers ---
    const handleCreate = async (resource, data) => {
        try { await axios.post(`${API_URL}/${resource}`, data, { headers: getAuthHeaders() }); } 
        catch (e) { alert(e.response?.data?.message || 'Failed to create item.'); }
    };
    const handleUpdate = async (resource, id, data) => {
        try { await axios.put(`${API_URL}/${resource}/${id}`, data, { headers: getAuthHeaders() }); }
        catch (e) { alert(e.response?.data?.message || 'Failed to update item.'); }
    };
    const handleDelete = async (resource, id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try { await axios.delete(`${API_URL}/${resource}/${id}`, { headers: getAuthHeaders() }); }
            catch (e) { alert(e.response?.data?.message || 'Failed to delete item.'); }
        }
    };
    
    // --- Subscription Handlers (FIXED) ---
    const handleSubscriptionAction = async (action, subscriptionId) => {
        try {
            await axios.put(`${API_URL}/subscriptions/${subscriptionId}/${action}`, {}, { headers: getAuthHeaders() });
            // Real-time listener will handle the data refresh
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${action} subscription.`);
        }
    };

    const handlePauseSubscription = (id) => handleSubscriptionAction('pause', id);
    const handleResumeSubscription = (id) => handleSubscriptionAction('resume', id);
    const handleCancelSubscription = (id) => handleSubscriptionAction('cancel', id);
    
    // Admin override for subscriptions
    const handleAdminSubscriptionAction = async (action, subscriptionId) => {
         try {
            await axios.put(`${API_URL}/admin/subscriptions/${subscriptionId}/${action}`, {}, { headers: getAuthHeaders() });
        } catch (error) {
            alert(error.response?.data?.message || `Failed to perform admin action: ${action}.`);
        }
    };

    // --- Other Handlers ---
    const handleCreateOrder = (orderData) => handleCreate('orders', orderData);
    const handleSubscribe = (planId) => handleCreate('subscriptions/subscribe', { planId });

    const renderView = () => {
        switch (view) {
            case 'admin_portal':
                return <AdminPortal 
                            onLogout={handleLogout} 
                            allCustomers={allCustomers} allAgents={allAgents} allDeliveries={allDeliveries} 
                            allPayments={allPayments} allSupportTickets={allSupportTickets} 
                            allPasswordRequests={allPasswordRequests} allProducts={allProducts} 
                            allCategories={allCategories} allOrders={allOrders} 
                            allSubscriptionPlans={allSubscriptionPlans} allSubscriptions={allSubscriptions}
                            onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete}
                            onAdminSubscriptionAction={handleAdminSubscriptionAction}
                            ModalComponent={Modal}
                        />;
            case 'agent_portal':
                return <AgentPortal 
                            agent={loggedInUser} 
                            allDeliveries={allDeliveries}
                            onLogout={handleLogout} 
                            onUpdateDelivery={(id, data) => handleUpdate('deliveries', id, data)}
                            ModalComponent={Modal}
                        />;
            case 'auth':
                return <AuthPage onAdminAgentLogin={handleLogin} onCustomerAuth={handleCustomerAuth} onBack={() => setView('landing_page')} initialUserType={initialAuthType} />;
            case 'customer_portal':
                return <CustomerPortal 
                            user={loggedInUser} 
                            onLogout={handleLogout}
                            onCreateOrder={handleCreateOrder}
                            onSubscribe={handleSubscribe}
                            products={allProducts}
                            categories={allCategories}
                            subscriptionPlans={allSubscriptionPlans}
                            activeSubscriptions={myActiveSubscriptions}
                            orders={myOrders}
                            onPauseSubscription={handlePauseSubscription}
                            onResumeSubscription={handleResumeSubscription}
                            onCancelSubscription={handleCancelSubscription}
                        />;
            case 'landing_page':
            default:
                return <LandingPage onAuthClick={() => setView('auth')} onPortalLinkClick={(type) => {setInitialAuthType(type); setView('auth');}} />;
        }
    }

    return (
        <>
            {confirmState.isOpen && <ConfirmModal {...confirmState} onConfirm={() => confirmState.onConfirm()} onCancel={() => setConfirmState({isOpen: false})} />}
            {renderView()}
        </>
    );
}

