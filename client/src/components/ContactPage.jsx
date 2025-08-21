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

// The main Contact Page component
export default function ContactPage({ onBack }) {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* <PageHeader onBack={onBack} /> */}
            <main className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Send us a Message</h1>
                        <p className="mt-4 text-lg text-gray-600">Have questions about our fruit bowls or want to customize your order? We'd love to hear from you!</p>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                             <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" id="name" placeholder="Enter your full name" className="w-full p-3 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" id="phone" placeholder="Enter your phone number" className="w-full p-3 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" id="email" placeholder="Enter your email address" className="w-full p-3 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea id="message" placeholder="Tell us about your inquiry..." rows="4" className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">Send Message</button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                             <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Phone Numbers</h3>
                                <p className="text-gray-600">+91 94935 32772</p>
                            </div>
                             <div className="bg-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Area</h3>
                                <p className="text-gray-600">Local delivery available in Dharmavaram.</p>
                            </div>
                             <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-semibold mb-3">Need Immediate Help?</h3>
                                <p>For urgent orders or immediate assistance, call us directly. We're here to help!</p>
                                <p className="mt-4 font-bold">📞 7995933899</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
