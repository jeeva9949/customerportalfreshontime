import React, { useMemo } from 'react';
import { format, subDays, startOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// ADMIN DASHBOARD ANALYTICS
// --- Reusable Components ---
const KpiCard = ({ title, value, trend, icon, color, insight }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`text-2xl p-3 rounded-full ${color}`}>
                {icon}
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
            <span className={`font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-gray-500">{insight}</span>
        </div>
    </div>
);

const AlertBanner = ({ message, type }) => {
    const alertStyles = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
    };
    return (
        <div className={`p-4 rounded-lg ${alertStyles[type]}`}>
            <p className="font-semibold">{message}</p>
        </div>
    );
};


// --- Main Dashboard Component (Now accepts props) ---
export default function DashboardOverview({ deliveries, payments, agents, customers }) {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const startOfThisMonth = startOfMonth(today);

    // Calculate KPIs dynamically from props
    const kpiData = useMemo(() => {
        const completedDeliveries = deliveries.filter(d => d.status === 'Delivered').length;
        const pendingDeliveries = deliveries.filter(d => d.status === 'Pending' || d.status === 'In Transit').length;

        const todaysRevenue = payments
            .filter(p => p.status === 'Paid' && new Date(p.paid_date).toDateString() === today.toDateString())
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            
        const yesterdayRevenue = payments
            .filter(p => p.status === 'Paid' && new Date(p.paid_date).toDateString() === yesterday.toDateString())
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        const revenueTrend = yesterdayRevenue > 0 ? ((todaysRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : todaysRevenue > 0 ? 100 : 0;

        const activeAgents = new Set(deliveries.filter(d => new Date(d.delivery_date).toDateString() === today.toDateString()).map(d => d.agent_id)).size;
        const totalAgents = agents.length;

        const newCustomers = customers.filter(c => new Date(c.first_purchase_date) >= startOfThisMonth).length;

        return { completedDeliveries, pendingDeliveries, todaysRevenue, revenueTrend, activeAgents, totalAgents, newCustomers };
    }, [deliveries, payments, agents, customers, today, yesterday, startOfThisMonth]);

    // Calculate chart data dynamically from props and calculated KPIs
    const chartData = useMemo(() => {
        const deliveryStatusData = [
            { name: 'Completed', value: kpiData.completedDeliveries, color: '#10B981' },
            { name: 'Pending', value: kpiData.pendingDeliveries, color: '#F59E0B' },
            { name: 'Cancelled', value: deliveries.filter(d => ['Cancelled', 'Failed'].includes(d.status)).length, color: '#EF4444' },
        ];

        const agentStatusData = [
            { name: 'Active', value: kpiData.activeAgents, color: '#3B82F6' },
            { name: 'Idle', value: kpiData.totalAgents - kpiData.activeAgents, color: '#6B7280' },
        ];

        const revenueTrendData = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(today, 6 - i);
            const dailyTotal = payments
                .filter(p => p.status === 'Paid' && new Date(p.paid_date).toDateString() === date.toDateString())
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            return { name: format(date, 'MMM d'), revenue: dailyTotal };
        });

        const customerGrowthData = Array.from({ length: 6 }, (_, i) => {
            const monthStart = startOfMonth(subDays(today, i * 30));
            const count = customers.filter(c => new Date(c.first_purchase_date) >= monthStart).length;
            return { name: format(monthStart, 'MMM'), newCustomers: count };
        }).reverse();

        return { deliveryStatusData, agentStatusData, revenueTrendData, customerGrowthData };
    }, [kpiData, deliveries, payments, customers, today]);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Today's Revenue" value={`$${kpiData.todaysRevenue.toFixed(2)}`} trend={kpiData.revenueTrend} icon="💵" color="bg-green-100 text-green-600" insight="vs yesterday" />
                <KpiCard title="Deliveries" value={`${kpiData.completedDeliveries} / ${kpiData.pendingDeliveries}`} trend={12.0} icon="🚚" color="bg-yellow-100 text-yellow-600" insight="Completed / Pending" />
                <KpiCard title="Active Agents" value={`${kpiData.activeAgents} / ${kpiData.totalAgents}`} trend={-5.0} icon="👥" color="bg-blue-100 text-blue-600" insight="today" />
                <KpiCard title="New Customers" value={kpiData.newCustomers} trend={20.0} icon="🎉" color="bg-indigo-100 text-indigo-600" insight="this month" />
            </div>
            
            {/* Alerts Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <AlertBanner message="✅ Revenue up compared to last week" type="success" />
                 <AlertBanner message={`⚠ ${kpiData.pendingDeliveries} deliveries are pending assignment`} type="warning" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.revenueTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-gray-800 mb-4">Delivery Status</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={chartData.deliveryStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {chartData.deliveryStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-gray-800 mb-4">Customer Growth</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.customerGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="newCustomers" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-gray-800 mb-4">Agent Status</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={chartData.agentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                               {chartData.agentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
