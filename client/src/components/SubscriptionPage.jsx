import React from 'react';
import { format, differenceInDays } from 'date-fns';

// --- NEW Helper Components for Subscription Management ---

const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.expired}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const ProgressBar = ({ total, current }) => {
    const percentage = Math.max(0, Math.min(100, (current / total) * 100));
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
    </div>
);

const SubscriptionCard = ({ sub, onPause, onResume, onCancel, onRenew }) => {
    const { SubscriptionPlan: plan } = sub;
    const today = new Date();
    const startDate = new Date(sub.startDate);
    const endDate = new Date(sub.endDate);

    const totalDurationDays = differenceInDays(endDate, startDate) || 1;
    const daysPassed = differenceInDays(today, startDate);
    const daysLeft = Math.max(0, differenceInDays(endDate, today));
    
    const canRenew = daysLeft <= 3 && sub.status === 'active';

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{plan?.name || 'Subscription Plan'}</h3>
                    <p className="text-green-600 font-bold">₹{plan?.price || '0.00'}</p>
                </div>
                <StatusBadge status={sub.status} />
            </div>
            <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-gray-600">Days Left</span>
                    <span className="font-bold text-green-600">{daysLeft}</span>
                </div>
                <ProgressBar total={totalDurationDays} current={daysPassed} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-gray-100 py-4">
                <InfoItem label="Start Date" value={format(startDate, 'MMM dd, yyyy')} />
                <InfoItem label="End Date" value={format(endDate, 'MMM dd, yyyy')} />
                <InfoItem label="Next Delivery" value={sub.status === 'active' ? 'Tomorrow' : 'Paused'} />
                <InfoItem label="Plan ID" value={`#${sub.id}`} />
            </div>
            <div className="flex flex-wrap gap-2">
                {sub.status === 'active' && <button onClick={() => onPause(sub.id)} className="flex-1 bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600">Pause</button>}
                {sub.status === 'paused' && <button onClick={() => onResume(sub.id)} className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600">Resume</button>}
                {sub.status !== 'cancelled' && sub.status !== 'expired' && <button onClick={() => onCancel(sub.id)} className="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">Cancel Next Cycle</button>}
                {canRenew && <button onClick={() => onRenew(sub.id)} className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600">Renew Now</button>}
            </div>
        </div>
    );
};

// --- Main Subscription Page Component ---

const SubscriptionPage = ({ 
    subscriptionPlans = [], 
    activeSubscriptions = [], 
    onSelectPlan = () => {},
    // NEW props for management
    onPause = () => {}, 
    onResume = () => {}, 
    onCancel = () => {}, 
    onRenew = () => {} 
}) => {

    // --- EXISTING CODE FROM YOUR FILE (NO CHANGES) ---
    const getPlansWithBenefits = (plans) => {
        return plans.map(plan => {
            if (plan.name.toLowerCase().includes('premium')) {
                return { ...plan, tag: 'Best for Health Goals', benefits: ['Exotic Bowl included', 'Protein Bowl included', 'Custom Bowl options', 'Priority delivery', 'Nutrition consultation'] };
            }
            if (plan.name.toLowerCase().includes('classic')) {
                 return { ...plan, tag: 'Everyday Nutrition Choice', benefits: ['Classic Bowl included', 'Vitamin Bowl included', 'Salad Bowl included', 'Flexible delivery', 'Health tracking'] };
            }
            return { ...plan, tag: 'Great Value', benefits: ['Daily Fresh Bowls', 'Standard delivery', 'Cancel anytime'] };
        });
    };

    const plans = getPlansWithBenefits(subscriptionPlans);

    const whatsInside = {
        "Fruit-based Smoothies": ["Classic Banana", "Mango", "Pineapple", "Strawberry", "Watermelon", "Apple", "Orange", "Grapes", "Guava Freshness", "Kiwi Kick", "Sapota Shake", "Lichi", "Custard Apple", "Pomegranate", "Mixed Fruit Blast", "Seasonal Special"],
        "Veggie + Fruit Combos": ["Carrot Orange Glow", "Beetroot Apple Mix", "Spinach Pineapple Refresh", "Cucumber Mint Cooler", "Tomato Carrot Blend", "And 15+ more varieties..."],
        "Health & Fitness Smoothies": ["Oats Banana Smoothie", "Protein Peanut Smoothie", "Green Detox", "Immunity Booster", "Weight Gain Shake", "And 13+ more options..."]
    };

    const whySubscribe = [
        { title: 'Fresh Daily', icon: '🌿', description: 'Ingredients sourced and prepared the same day.' },
        { title: 'Healthy', icon: '❤️', description: 'Nutrient-packed options for a healthy lifestyle.' },
        { title: 'Save Money', icon: '💰', description: 'Get the best value with our subscription plans.' },
        { title: 'Fast Delivery', icon: '🚚', description: 'On-time delivery, every single morning.' },
    ];

    return (
        <div className="animate-fade-in">
            {/* --- NEW: Subscription Management Section --- */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">My Subscriptions</h1>
            <div className="space-y-6">
                {activeSubscriptions && activeSubscriptions.length > 0 ? (
                    activeSubscriptions.map(sub => (
                        <SubscriptionCard 
                            key={sub.id} 
                            sub={sub}
                            onPause={onPause}
                            onResume={onResume}
                            onCancel={onCancel}
                            onRenew={onRenew}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm">You have no active subscriptions.</p>
                )}
            </div>

            {/* --- EXISTING CODE FROM YOUR FILE (NO CHANGES) --- */}
            <div className="mt-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Explore Our Subscription Plans</h2>
                    <p className="text-gray-600 mt-2">Save more with our subscription plans</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <div key={i} className={`rounded-2xl p-8 border-2 transition-all transform hover:-translate-y-2 ${plan.bestValue ? 'border-green-500 bg-white shadow-2xl' : 'bg-white shadow-lg'}`}>
                            {plan.bestValue && <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</span>}
                            <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                            <p className="text-4xl font-bold my-4 text-center">₹{plan.price}<span className="text-lg font-medium text-gray-500">{plan.duration}</span></p>
                            <div className="text-center mb-6">
                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${plan.bestValue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{plan.tag}</span>
                            </div>
                            <ul className="space-y-3 text-gray-600 mb-8">
                                {plan.benefits.map((benefit, j) => (
                                    <li key={j} className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => onSelectPlan(plan)} className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.bestValue ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                                Choose {plan.name}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <h3 className="text-3xl font-bold text-center mb-8">What’s Inside the Subscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Object.entries(whatsInside).map(([category, items]) => (
                            <div key={category} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-lg">
                                <h4 className="text-xl font-bold mb-4 text-gray-800">{category}</h4>
                                <ul className="space-y-2 text-gray-600">
                                    {items.map((item, i) => <li key={i} className="flex items-center"><span className="text-green-500 mr-2">✓</span> {item}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-20 text-center">
                     <h3 className="text-3xl font-bold mb-8">Why Subscribe?</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {whySubscribe.map((item, i) => (
                            <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-lg flex flex-col items-center">
                                <span className="text-4xl mb-2">{item.icon}</span>
                                <p className="font-semibold text-lg">{item.title}</p>
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
