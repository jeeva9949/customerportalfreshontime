import React, { useState, useEffect } from 'react';

export default function AuthPage({ onAdminAgentLogin, onAdminRegister, onCustomerAuth, onBack, initialUserType = 'customer' }) {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState(initialUserType);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', mobile: '', adminCode: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        setUserType(initialUserType);
        setIsLogin(true);
        setError('');
        setFormData({ name: '', email: '', password: '', mobile: '', adminCode: '' });
    }, [initialUserType]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (userType === 'customer') {
                await onCustomerAuth(formData, isLogin);
            } else {
                if (isLogin) {
                    await onAdminAgentLogin(formData.email, formData.password, userType);
                } else {
                    await onAdminRegister(formData.name, formData.email, formData.password, formData.adminCode);
                    alert('Admin Registration successful! Please log in.');
                    setUserType('admin');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const switchAuthMode = (newIsLogin, newUserType) => {
        setIsLogin(newIsLogin);
        setUserType(newUserType);
        setError('');
        setFormData({ name: '', email: '', password: '', mobile: '', adminCode: '' });
    };

    const getTitle = () => {
        if (userType === 'admin') return isLogin ? 'Admin Login' : 'Admin Registration';
        if (userType === 'agent') return 'Agent Login';
        return isLogin ? 'Welcome Back!' : 'Create a Customer Account';
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <button onClick={onBack} className="text-gray-600 hover:text-orange-500 transition-colors">&larr; Back to Home</button>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg w-full">
                    <img src="https://res.cloudinary.com/dhvi0ftfi/image/upload/v1755159695/freshontimelo_iswxmn.jpg" alt="FreshOnTime Logo" className="w-24 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{getTitle()}</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (userType === 'customer' || userType === 'admin') && (
                           <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="p-3 border rounded-lg w-full" required />
                        )}
                        {!isLogin && userType === 'customer' && (
                            <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Phone Number" className="p-3 border rounded-lg w-full" required />
                        )}
                        {!isLogin && userType === 'admin' && (
                            <input type="text" name="adminCode" value={formData.adminCode} onChange={handleInputChange} placeholder="Admin Registration Code" className="p-3 border rounded-lg w-full" required />
                        )}
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="p-3 border rounded-lg w-full" required />
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="p-3 border rounded-lg w-full" required />
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 w-full rounded-lg transition-colors">{isLogin ? 'Login' : 'Sign Up'}</button>
                    </form>

                    <div className="text-center mt-4 text-sm text-gray-600">
                        {userType === 'customer' && (
                            isLogin
                            ? <>Don't have an account? <button onClick={() => switchAuthMode(false, 'customer')} className="font-semibold text-orange-500 hover:underline">Sign Up</button></>
                            : <>Already have an account? <button onClick={() => switchAuthMode(true, 'customer')} className="font-semibold text-orange-500 hover:underline">Login</button></>
                        )}
                        {userType === 'admin' && isLogin && (
                           <>Need to register a new Admin? <button onClick={() => switchAuthMode(false, 'admin')} className="font-semibold text-orange-500 hover:underline">Register</button></>
                        )}
                    </div>

                     <div className="text-center mt-2 text-xs text-gray-400">
                        <button onClick={() => switchAuthMode(true, 'admin')} className="hover:underline">Admin Login</button>
                        <span className="mx-1">&middot;</span>
                        <button onClick={() => switchAuthMode(true, 'agent')} className="hover:underline">Agent Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
