import React, { useState, useMemo } from 'react';
import { useLocationTracker } from '../hooks/useLocationTracker';

// --- Re-usable components ---
const StatusPill = ({ status }) => {
    const statusClasses = {
        Pending: 'bg-yellow-100 text-yellow-800', 'In Transit': 'bg-blue-100 text-blue-800',
        Delivered: 'bg-green-100 text-green-800', Failed: 'bg-red-100 text-red-800',
        Cancelled: 'bg-red-100 text-red-800'
    };
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status || 'N/A'}</span>;
};

// --- Main Agent Portal Component ---
export default function AgentPortal({ agent, allDeliveries, allAgents, allCustomers, onLogout, onUpdateDelivery, onReportIssue, onRequestPasswordChange, onUpdateNotificationPreference, ModalComponent }) {
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
    const handleNavigate = (address) => { if (!address) { alert("Address not available."); return; } window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank'); };

    const BottomNavLink = ({ page, label, icon }) => (<button onClick={() => setActiveTab(page)} className={`flex flex-col items-center justify-center w-full transition-colors py-1 ${activeTab === page ? 'text-orange-400' : 'text-gray-400 hover:text-orange-400'}`}><span className="text-2xl">{icon}</span><span className="text-xs font-medium">{label}</span></button>);
    const PageHeader = () => { let title = 'Deliveries'; if (activeTab === 'history') title = 'History'; if (activeTab === 'profile') title = 'Profile'; if (activeTab === 'support') title = 'Support'; return (<header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10 p-4"><div className="flex justify-between items-center"><div className="flex items-center gap-4"><img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelo_iswxmn.jpg" alt="Logo" className="h-8 w-auto rounded-md"/><h1 className="text-xl font-bold text-orange-400">{title}</h1></div><div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${isTracking ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}><span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>{isTracking ? 'Tracking Live' : 'Tracking Off'}</div></div>{trackingError && <p className="text-xs text-red-400 text-center mt-2">{trackingError}</p>}</header>); };

    const renderPageContent = () => {
        switch(activeTab) {
            case 'history': return (<div className="p-4 space-y-2"><h2 className="text-xl font-bold text-gray-200">Delivery History</h2>{historyDeliveries.length > 0 ? historyDeliveries.map(delivery => { const customer = allCustomers.find(c => c.id === delivery.customer_id); return (<div key={delivery.id} className="bg-slate-800 p-4 rounded-xl border-b border-slate-700/50"><div className="flex justify-between items-center"><div><h4 className="font-semibold text-lg text-white">{customer?.name || 'N/A'}</h4><p className="text-sm text-gray-400">{customer?.address || 'N/A'}</p><p className="text-xs text-gray-500 mt-1">Completed: {new Date(delivery.updatedAt).toLocaleDateString()}</p></div><StatusPill status={delivery.status} /></div></div>);}) : <div className="text-center text-gray-500 mt-8 p-10 bg-slate-800 rounded-xl">No past deliveries found.</div>}</div>);
            case 'profile': return (<div className="p-4"><h2 className="text-xl font-bold text-gray-200 mb-4">Profile & Settings</h2><div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-2xl mx-auto"><div className="flex items-center space-x-4 mb-6"><div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold">{agentDetails.name.charAt(0).toUpperCase()}</div><div><h3 className="text-xl font-bold text-white">{agentDetails.name}</h3><p className="text-gray-400">{agentDetails.email}</p><p className="text-gray-400">{agentDetails.mobile || '+1 (555) 123-4567'}</p></div></div><div className="space-y-6"><div><label className="block text-sm font-medium text-gray-400 mb-1">Update Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="mt-1 block w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"/></div><div className="flex items-center justify-between"><span className="font-medium text-gray-300">Notifications</span><label htmlFor="notifications-toggle" className="inline-flex relative items-center cursor-pointer"><input type="checkbox" checked={notificationsEnabled} onChange={handleNotificationToggle} id="notifications-toggle" className="sr-only peer"/><div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div></label></div><button onClick={handleSaveChanges} className="w-full bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Save Changes</button></div></div></div>);
            case 'support': return (<div className="p-4"><h2 className="text-xl font-bold text-gray-200 mb-4">Support</h2><div className="bg-slate-800 p-6 rounded-2xl shadow-md max-w-2xl mx-auto space-y-8"><div><h3 className="text-lg font-semibold text-white mb-3">Contact Admin</h3><div className="flex gap-4"><a href="tel:+919493532772" className="flex-1 flex items-center justify-center gap-2 border border-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"><span>📞</span> Call Support</a><button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"><span>💬</span> Chat with Admin</button></div></div><div><h3 className="text-lg font-semibold text-white mb-3">Report an Issue</h3><form onSubmit={handleReportSubmit} className="space-y-4"><select value={issueType} onChange={e => setIssueType(e.target.value)} className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"><option>Incorrect Address</option><option>Customer Not Available</option><option>Package Damaged</option><option>Vehicle Issue</option><option>Other</option></select><textarea value={issueDetails} onChange={e => setIssueDetails(e.target.value)} rows="4" className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Provide more details..."></textarea><button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">Submit Report</button></form></div></div></div>);
            default: return (<div className="p-4"><div className="bg-slate-800 p-4 rounded-xl mb-6"><div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-white">Welcome, {agent.name}!</h2><p className="text-gray-400">Here's your summary for today.</p></div><button onClick={onLogout} className="p-2 rounded-full text-gray-400 hover:bg-slate-700"><span className="text-2xl">&rarr;</span></button></div></div><div className="grid grid-cols-3 gap-4 mb-6"><div className="bg-slate-800 p-4 rounded-xl text-center"><p className="text-gray-400 text-sm font-medium">Today's</p><p className="text-3xl font-bold text-white">{stats.total}</p></div><div className="bg-slate-800 p-4 rounded-xl text-center"><p className="text-gray-400 text-sm font-medium">Pending</p><p className="text-3xl font-bold text-yellow-400">{stats.pending}</p></div><div className="bg-slate-800 p-4 rounded-xl text-center"><p className="text-gray-400 text-sm font-medium">Completed</p><p className="text-3xl font-bold text-green-400">{stats.completed}</p></div></div><h3 className="text-lg font-bold mb-3 text-gray-300 px-4">Active Deliveries</h3><div className="space-y-4">{activeDeliveries.length > 0 ? activeDeliveries.map(delivery => { const customer = allCustomers.find(c => c.id === delivery.customer_id); return (<div key={delivery.id} className="bg-slate-800 p-4 rounded-xl"><div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-lg text-white">{customer?.name || 'N/A'}</h4><p className="text-sm text-gray-400">{customer?.address || 'N/A'}</p></div><StatusPill status={delivery.status} /></div><div className="flex gap-3 mt-4"><button onClick={() => handleNavigate(customer?.address)} className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 text-sm flex items-center justify-center gap-2"><span>🗺️</span> Navigate</button><button onClick={() => openStatusModal(delivery)} className="flex-1 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 text-sm flex items-center justify-center gap-2"><span>✏️</span> Update Status</button></div></div>);}) : <p className="text-center text-gray-500 mt-8 py-10 bg-slate-800 rounded-xl">No active deliveries for today.</p>}</div></div>);
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-gray-300">
            {isModalOpen && (<ModalComponent title="Update Delivery Status" onClose={() => setIsModalOpen(false)}><div className="space-y-4 text-white"><p>Update status for <strong>{allCustomers.find(c => c.id === selectedDelivery.customer_id)?.name}</strong>:</p><div className="flex flex-col sm:flex-row justify-around gap-3"><button onClick={() => handleStatusUpdate('In Transit')} className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold">In Transit</button><button onClick={() => handleStatusUpdate('Delivered')} className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold">Delivered</button><button onClick={() => handleStatusUpdate('Failed')} className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold">Failed</button></div></div></ModalComponent>)}
            <main className="pb-20"><PageHeader />{renderPageContent()}</main>
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 flex justify-around z-20"><BottomNavLink page="deliveries" label="Deliveries" icon="📦" /><BottomNavLink page="history" label="History" icon="🕒" /><BottomNavLink page="profile" label="Profile" icon="👤" /><BottomNavLink page="support" label="Support" icon="💡" /></nav>
        </div>
    );
}
