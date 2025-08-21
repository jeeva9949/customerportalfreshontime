import React from 'react';

const SubscriptionSection = () => {
    const plans = [
        { name: 'Daily', price: '89', duration: '' },
        { name: 'Weekly', price: '666', duration: '' },
        { name: 'Combo Weekly', price: '1111', duration: '' },
        { name: 'Monthly Smoothies', price: '1400', duration: '/month' },
        { name: 'Monthly Fruit Bowl', price: '1999', duration: '/month' },
        { name: 'Combo Monthly', price: '3000', duration: '/month', bestValue: true },
    ];

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
        <section className="py-20 bg-gray-50" style={{backgroundImage: 'url(https://www.toptal.com/designers/subtlepatterns/uploads/leaves.png)'}}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Fresh, Healthy, Yours – Subscription Plans for Bowls & Smoothies</h2>
                    <p className="text-gray-600 mt-2">Save more with our subscription plans</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <div key={i} className={`relative rounded-2xl p-8 border-2 transition-all transform hover:-translate-y-2 ${plan.bestValue ? 'border-green-500 bg-green-50 shadow-2xl' : 'bg-white shadow-lg'}`}>
                            {plan.bestValue && <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3 right-5 transform rotate-3">Best Value ⭐</span>}
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <p className="text-4xl font-bold my-4">₹{plan.price}<span className="text-lg font-medium text-gray-500">{plan.duration}</span></p>
                            <button className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.bestValue ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Subscribe Now</button>
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

export default SubscriptionSection;
