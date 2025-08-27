import React from 'react';
import { format, differenceInDays, formatDistanceToNow } from 'date-fns';

// --- Helper Components ---
const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${styles[status]}`}>{status}</span>;
};

const InfoCard = ({ label, value, children }) => (
    <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-gray-900 font-bold text-md">{value}</p>
        {children}
    </div>
);

// --- Main Component ---
export default function SubscriptionManagementAdminView({
    subscription,
    deliveries = [],
    agents = [],
    onPause,
    onResume,
    onCancel
}) {
    if (!subscription) {
        return <div className="text-center p-8 bg-gray-50 rounded-lg">This customer has no active subscription.</div>;
    }

    const { SubscriptionPlan: plan, PauseHistories: pauseHistory } = subscription;
    const daysLeft = differenceInDays(new Date(subscription.endDate), new Date());
    const customerDeliveries = deliveries.filter(d => d.customer_id === subscription.customerId);
    const completedDeliveries = customerDeliveries.filter(d => d.status === 'Delivered').length;
    const pendingDeliveries = customerDeliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit').length;
    const nextDelivery = customerDeliveries.find(d => d.status === 'Pending');
    const assignedAgent = nextDelivery ? agents.find(a => a.id === nextDelivery.agent_id) : null;

    return (
        <div className="space-y-6 p-1">
            {/* Header */}
            <div className="flex justify-between items-start bg-white p-4 rounded-xl shadow-sm border">
                <div>
                    <h4 className="font-bold text-lg text-gray-800">{plan.name}</h4>
                    <p className="font-bold text-green-600">₹{plan.price} {plan.duration}</p>
                </div>
                <StatusBadge status={subscription.status} />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button disabled={subscription.status !== 'active'} onClick={() => onPause(subscription.id)} className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300">Pause</button>
                <button disabled={subscription.status !== 'paused'} onClick={() => onResume(subscription.id)} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300">Resume</button>
                <button disabled={subscription.status === 'cancelled'} onClick={() => onCancel(subscription.id)} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300">Cancel</button>
                <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg">Extend</button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCard label="Subscription Period" value={`${format(new Date(subscription.startDate), 'MMM dd')} - ${format(new Date(subscription.endDate), 'MMM dd, yyyy')}`} />
                <InfoCard label="Days Left" value={`${daysLeft} days`} />
                <InfoCard label="Next Delivery" value={subscription.status === 'active' && nextDelivery ? format(new Date(nextDelivery.delivery_date), 'MMM dd, yyyy') : 'N/A'} />
                <InfoCard label="Deliveries" value={`${completedDeliveries} Completed / ${pendingDeliveries} Pending`} />
                <InfoCard label="Assigned Agent">
                    {assignedAgent ? `${assignedAgent.name} (${assignedAgent.mobile})` : 'Not Assigned'}
                </InfoCard>
                 <InfoCard label="Payment Status" value="Paid" />
            </div>

            {/* Pause History */}
            <div>
                <h5 className="font-semibold mb-2">Pause History</h5>
                <div className="space-y-2">
                    {pauseHistory && pauseHistory.length > 0 ? (
                        pauseHistory.map(p => (
                            <div key={p.id} className="text-sm bg-gray-50 p-3 rounded-lg">
                                Paused for <span className="font-bold">{formatDistanceToNow(new Date(p.pauseDate))}</span> from {format(new Date(p.pauseDate), 'MMM dd')} to {p.resumeDate ? format(new Date(p.resumeDate), 'MMM dd') : 'now'}.
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No pause history for this subscription.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
