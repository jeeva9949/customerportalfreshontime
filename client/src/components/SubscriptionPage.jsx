import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

const SubscriptionPage = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch(`${API_URL}/subscriptions/plans`);
                if (!response.ok) {
                    throw new Error('Failed to fetch subscription plans.');
                }
                let data = await response.json();

                // Add benefits data to each plan from the backend
                // If your backend doesn't provide benefits, we can map them here
                const plansWithBenefits = data.map(plan => {
                    if (plan.name.toLowerCase().includes('premium')) {
                        return {
                            ...plan,
                            tag: 'Best for Health Goals',
                            benefits: [
                                'Exotic Bowl included',
                                'Protein Bowl included',
                                'Custom Bowl options',
                                'Priority delivery',
                                'Nutrition consultation'
                            ]
                        };
                    }
                    if (plan.name.toLowerCase().includes('classic')) {
                         return {
                            ...plan,
                            tag: 'Everyday Nutrition Choice',
                            benefits: [
                                'Classic Bowl included',
                                'Vitamin Bowl included',
                                'Salad Bowl included',
                                'Flexible delivery',
                                'Health tracking'
                            ]
                        };
                    }
                    // Default benefits for other plans
                    return {
                        ...plan,
                        tag: 'Great Value',
                        benefits: [
                            'Daily Fresh Bowls',
                            'Standard delivery',
                            'Cancel anytime'
                        ]
                    };
                });
                
                setPlans(plansWithBenefits);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlans();
    }, []);

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

    if (isLoading) {
        return <div className="text-center py-20">Loading plans...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">Error: {error}</div>;
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800">Monthly Packs</h2>
                    <p className="text-gray-600 mt-2">Save more with our subscription plans</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.bestValue ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
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
        </section>
    );
};

export default SubscriptionPage;
