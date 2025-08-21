import React from 'react';

// A reusable header for the top of the page
// const PageHeader = ({ onBack }) => (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
//             <div className="flex items-center space-x-2">
//                 <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelogo_iswxmn.jpg" alt="FreshOnTime Logo" className="h-10 w-auto" />
//                 <span className="text-2xl font-bold text-gray-900">FreshOnTime</span>
//             </div>
//             <button onClick={onBack} className="text-gray-600 hover:text-green-600 font-semibold flex items-center gap-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
//                 Back to Home
//             </button>
//         </div>
//     </header>
// );

// The main About Page component
export default function AboutPage({ onBack }) {
    const values = [
        { title: 'Health First', description: 'We prioritize wellness by using only the freshest, natural ingredients in every bowl.' },
        { title: 'Quality Commitment', description: 'Every ingredient is carefully selected to ensure the highest quality and taste.' },
        { title: 'Community Focus', description: 'Building a healthier community, one fresh meal at a time.' },
        { title: 'Excellence', description: 'Striving for excellence in taste, nutrition, and customer service.' },
    ];

    const team = [
        { name: 'Yeshwanth Naidu', role: 'Founder & CEO', img: 'https://placehold.co/150x150/E2E8F0/4A5568?text=YN' },
        { name: 'Venkatesh', role: 'Co-founder & Operations', img: 'https://placehold.co/150x150/E2E8F0/4A5568?text=V' },
        { name: 'Kiran Naik', role: 'Co-founder & Delivery', img: 'https://placehold.co/150x150/E2E8F0/4A5568?text=KN' },
    ];

    const stats = [
        { value: '150+', label: 'Happy Customers' },
        { value: '100%', label: 'Fresh Guarantee' },
        { value: '6', label: 'Unique Bowl Options' },
    ];

    return (
        <div className="bg-gray-50">
            {/* <PageHeader onBack={onBack} /> */}
            <main className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Section */}
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">About Fresh On Time</h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">We believe healthy living starts with fresh food. Learn more about our story, mission, and the passionate team behind your daily fruit bowls.</p>
                    </div>

                    {/* Story Section */}
                    <div className="mt-12 max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
                                <div className="text-gray-600 space-y-4">
                                    <p>Our journey starts with FreshOnTime. "FreshOnTime" was founded with a simple yet powerful idea: to make it easy for everyone to get their daily dose of healthy food.</p>
                                    <p>What started as a simple idea has grown into a community of health-conscious individuals who trust us for their daily nutrition. We are proud to have served over 50 customers in just our first 3 days of operation.</p>
                                </div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800" alt="Bowl of fresh fruits" className="rounded-2xl shadow-md w-full h-auto" />
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="mt-16 bg-green-600 text-white rounded-2xl p-12 text-center max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p>To deliver daily health and happiness with natural, nutrient-rich food items. We are committed to serving the best quality, healthy food for everyone in our community.</p>
                    </div>

                    {/* Values Section */}
                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Our Values</h2>
                        <p className="mt-2 text-gray-600">The principles that guide everything we do.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 max-w-6xl mx-auto">
                            {values.map(value => (
                                <div key={value.title} className="bg-white p-6 rounded-2xl shadow-md">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="mt-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Meet Our Team</h2>
                        <p className="mt-2 text-gray-600">The passion that drives us behind FreshOnTime.</p>
                        <div className="flex flex-wrap justify-center gap-8 mt-8">
                            {team.map(member => (
                                <div key={member.name} className="text-center">
                                    <img src={member.img} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg" />
                                    <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                                    <p className="text-gray-500">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                        {stats.map(stat => (
                            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-md text-center">
                                <p className="text-4xl font-bold text-green-600">{stat.value}</p>
                                <p className="text-gray-600 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
