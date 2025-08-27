import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

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
        <div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Confirm</button></div>
    </Modal>
);


// --- Main App Component (Root) ---
export default function App() {
    const [view, setView] = useState('landing_page');
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [initialAuthType, setInitialAuthType] = useState('customer');
    
    // Combined state for all data
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

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setLoggedInUser(null);
        setView('landing_page');
    }, []);
  
    const fetchData = useCallback(async (currentToken) => {
        if (!currentToken) return;
        try {
            const authHeader = { 'Authorization': `Bearer ${currentToken}` };
            const [
                customersRes, agentsRes, deliveriesRes, paymentsRes, supportRes, passwordRes,
                productsRes, categoriesRes, subPlansRes, ordersRes, activeSubsRes
            ] = await Promise.all([
                fetch(`${API_URL}/customers`, { headers: authHeader }),
                fetch(`${API_URL}/agents`, { headers: authHeader }),
                fetch(`${API_URL}/deliveries`, { headers: authHeader }),
                fetch(`${API_URL}/payments`, { headers: authHeader }),
                fetch(`${API_URL}/support`, { headers: authHeader }),
                fetch(`${API_URL}/password-requests`, { headers: authHeader }),
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/products/categories`),
                fetch(`${API_URL}/subscriptions/plans`),
                fetch(`${API_URL}/orders`, { headers: authHeader }),
                fetch(`${API_URL}/subscriptions/my-subscriptions`, { headers: authHeader })
            ]);
            
            const checkResponse = async (res, setter) => {
                if (res.ok) setter(await res.json());
            };
            
            await checkResponse(customersRes, setCustomers);
            await checkResponse(agentsRes, setAgents);
            await checkResponse(deliveriesRes, setDeliveries);
            await checkResponse(paymentsRes, setPayments);
            await checkResponse(supportRes, setSupportTickets);
            await checkResponse(passwordRes, setPasswordRequests);
            await checkResponse(productsRes, setProducts);
            await checkResponse(categoriesRes, setCategories);
            await checkResponse(subPlansRes, setSubscriptionPlans);
            await checkResponse(ordersRes, setOrders);
            await checkResponse(activeSubsRes, setActiveSubscriptions);

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
                fetchData(token);
                if (parsedUser.role === 'Admin') setView('admin_dashboard');
                else if (parsedUser.role === 'Agent') setView('agent_portal');
                else setView('customer_portal');
            } catch (e) { handleLogout(); }
        } else {
            setLoggedInUser(null);
            setView('landing_page');
        }
    }, [token, handleLogout, fetchData]);

    useEffect(() => {
        if (!token) return;
        const socket = io(SOCKET_URL);
        const refetch = () => {
            if(loggedInUser) fetchData(token);
        };
        socket.on('connect', () => console.log('WebSocket connected!'));
        socket.on('connect_error', (err) => console.error('WebSocket connection error:', err.message));
        socket.on('deliveries_updated', refetch);
        socket.on('support_tickets_updated', refetch);
        socket.on('password_requests_updated', refetch);
        socket.on('customers_updated', refetch);
        socket.on('agents_updated', refetch);
        socket.on('payments_updated', refetch);
        socket.on('products_updated', refetch);
        socket.on('categories_updated', refetch);
        socket.on('orders_updated', refetch);
        socket.on('subscription_plans_updated', refetch);
        socket.on('subscriptions_updated', refetch);
        return () => socket.disconnect();
    }, [token, loggedInUser, fetchData]);

    const handleApiError = async (response) => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An unknown error occurred');
        }
        return response.json();
    };

    const handleAdminRegister = async (name, email, password, adminCode) => {
        const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, adminCode }) });
        await handleApiError(res);
    };

    const handleCustomerAuth = async (authData, isLogin) => {
        const endpoint = isLogin ? 'login' : 'register';
        const res = await fetch(`${API_URL}/customer-auth/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authData) });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Authentication failed');
        }
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
        const { token: newToken, user } = await handleApiError(res);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(newToken);
    };
    
    const handlePortalLinkClick = (userType) => {
        setInitialAuthType(userType);
        setView('auth');
    };

    const apiRequest = useCallback(async (endpoint, method, body = null) => {
        try {
            const authHeader = { 'Authorization': `Bearer ${token}` };
            const options = { method, headers: { ...authHeader, 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(`${API_URL}${endpoint}`, options);
            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.message || 'An unknown error occurred');
            }
        } catch (error) {
            console.error(`API request to ${endpoint} failed:`, error);
            alert(`Error: ${error.message}`);
        }
    }, [token]);
  
    const requestConfirmation = useCallback((title, message, onConfirm) => { setConfirmState({ isOpen: true, title, message, onConfirm }); }, []);
    const handleConfirm = useCallback(() => { if (confirmState.onConfirm) confirmState.onConfirm(); setConfirmState({ isOpen: false }); }, [confirmState]);
    const handleCancelConfirm = useCallback(() => { setConfirmState({ isOpen: false }); }, []);

    // --- API Handlers ---
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
    const handleCreateOrder = useCallback((orderData) => apiRequest('/orders', 'POST', orderData), [apiRequest]);
    const handleAddProduct = useCallback((productData) => apiRequest('/products', 'POST', productData), [apiRequest]);
    const handleUpdateProduct = useCallback((productData) => apiRequest(`/products/${productData.id}`, 'PUT', productData), [apiRequest]);
    const handleDeleteProduct = useCallback((id) => requestConfirmation('Delete Product?', 'This cannot be undone.', () => apiRequest(`/products/${id}`, 'DELETE')), [apiRequest, requestConfirmation]);
    const handleAddCategory = useCallback((categoryData) => apiRequest('/products/categories', 'POST', categoryData), [apiRequest]);
    const handleAddSubscriptionPlan = useCallback((planData) => apiRequest('/subscriptions/plans', 'POST', planData), [apiRequest]);
    const handleUpdateSubscriptionPlan = useCallback((planData) => apiRequest(`/subscriptions/plans/${planData.id}`, 'PUT', planData), [apiRequest]);
    const handleSubscribe = useCallback((planId) => apiRequest('/subscriptions/subscribe', 'POST', { planId }), [apiRequest]);
    const handleUpdateCustomerAddress = useCallback((addressData) => {
        if (loggedInUser && loggedInUser.id) {
            apiRequest(`/customers/${loggedInUser.id}`, 'PUT', { address: addressData });
        } else {
            console.error("User not logged in, cannot update address.");
            alert("Error: You must be logged in to update your address.");
        }
    }, [apiRequest, loggedInUser]);

    // --- Customer Subscription Management Handlers ---
    const handlePauseSubscription = async (subscriptionId) => {
        try {
            await fetch(`${API_URL}/subscriptions/${subscriptionId}/pause`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to pause subscription", error);
            alert('Could not pause subscription. Please try again.');
        }
    };

    const handleResumeSubscription = async (subscriptionId) => {
        try {
            await fetch(`${API_URL}/subscriptions/${subscriptionId}/resume`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to resume subscription", error);
            alert('Could not resume subscription. Please try again.');
        }
    };

    const handleCancelSubscription = async (subscriptionId) => {
        if (window.confirm('Are you sure you want to cancel this subscription? This will stop it from renewing.')) {
            try {
                await fetch(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to cancel subscription", error);
                alert('Could not cancel subscription. Please try again.');
            }
        }
    };

    const handleRenewSubscription = async (subscriptionId) => {
        if (window.confirm('Renew this subscription for another cycle?')) {
            try {
                await fetch(`${API_URL}/subscriptions/${subscriptionId}/renew`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to renew subscription", error);
                alert('Could not renew subscription. Please try again.');
            }
        }
    };

    // --- NEW ADMIN Subscription Management Handlers ---
    const handleAdminPauseSubscription = async (subscriptionId) => {
        await apiRequest(`/admin/subscriptions/${subscriptionId}/pause`, 'PUT');
    };

    const handleAdminResumeSubscription = async (subscriptionId) => {
        await apiRequest(`/admin/subscriptions/${subscriptionId}/resume`, 'PUT');
    };

    const handleAdminCancelSubscription = async (subscriptionId) => {
        requestConfirmation('Cancel Subscription?', 'This will mark the subscription as cancelled and it will not renew.', () => 
            apiRequest(`/admin/subscriptions/${subscriptionId}/cancel`, 'PUT')
        );
    };

    const renderView = () => {
        switch (view) {
            case 'admin_dashboard':
                return <AdminPortal 
                            onLogout={handleLogout} 
                            customers={customers} agents={agents} deliveries={deliveries} payments={payments} 
                            supportTickets={supportTickets} passwordRequests={passwordRequests} 
                            products={products} categories={categories} orders={orders} subscriptionPlans={subscriptionPlans}
                            onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} onDeleteCustomer={handleDeleteCustomer} 
                            onAddAgent={handleAddAgent} onUpdateAgent={handleUpdateAgent} onDeleteAgent={handleDeleteAgent}
                            onCreateDelivery={handleCreateDelivery} onUpdateDelivery={handleUpdateDelivery} onDeleteDelivery={handleDeleteDelivery}
                            onAddPayment={handleAddPayment} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment}
                            onResolveTicket={handleResolveTicket} onApprovePassword={handleApprovePassword}
                            onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct}
                            onAddCategory={handleAddCategory} 
                            onAddSubscriptionPlan={handleAddSubscriptionPlan} 
                            onUpdateSubscriptionPlan={handleUpdateSubscriptionPlan}
                            ModalComponent={Modal}
                            // Add these three new props below
                            onAdminPauseSubscription={handleAdminPauseSubscription}
                            onAdminResumeSubscription={handleAdminResumeSubscription}
                            onAdminCancelSubscription={handleAdminCancelSubscription}
                        />;
            case 'agent_portal':
                return <AgentPortal 
                            agent={loggedInUser} 
                            allDeliveries={deliveries} allAgents={agents} allCustomers={customers} 
                            onLogout={handleLogout} onUpdateDelivery={handleUpdateDelivery} 
                            onReportIssue={handleReportIssue} onRequestPasswordChange={handleRequestPasswordChange} 
                            onUpdateNotificationPreference={handleUpdateNotificationPreference} 
                            ModalComponent={Modal}
                        />;
            case 'auth':
                return <AuthPage onAdminAgentLogin={handleAdminAgentLogin} onAdminRegister={handleAdminRegister} onCustomerAuth={handleCustomerAuth} onBack={() => setView('landing_page')} initialUserType={initialAuthType} />;
            case 'customer_portal':
                return <CustomerPortal 
                            user={loggedInUser} 
                            onLogout={handleLogout}
                            onCreateOrder={handleCreateOrder}
                            onSubscribe={handleSubscribe}
                            onUpdateAddress={handleUpdateCustomerAddress}
                            products={products}
                            categories={categories}
                            subscriptionPlans={subscriptionPlans}
                            activeSubscriptions={activeSubscriptions}
                            orders={orders}
                            onPauseSubscription={handlePauseSubscription}
                            onResumeSubscription={handleResumeSubscription}
                            onCancelSubscription={handleCancelSubscription}
                            onRenewSubscription={handleRenewSubscription}
                        />;
            case 'landing_page':
            default:
                return <LandingPage onAuthClick={() => { setInitialAuthType('customer'); setView('auth'); }} onPortalLinkClick={handlePortalLinkClick} />;
        }
    }

    return (
        <>
            {confirmState.isOpen && <ConfirmModal {...confirmState} onConfirm={handleConfirm} onCancel={handleCancelConfirm} />}
            {renderView()}
        </>
    );
}
