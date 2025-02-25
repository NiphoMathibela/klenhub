import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      
      // Get the redirect path from location state or default to dashboard for admin, home for users
      const from = location.state?.from?.pathname || (isAdmin ? '/admin/dashboard' : '/');
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-6">LOGIN</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className='py-4'>
            <p className='text-gray-700'>Don't have an account? <span className='text-black font-bold cursor-pointer'><Link to="/register">REGISTER</Link></span></p>
          </div>
          <button type="submit" className="w-full py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
