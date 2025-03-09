import React, { useState } from 'react';
import { authService } from '../services/api';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(email);
      setMessage('Password reset email sent. Please check your inbox.');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mt-36 mb-6">Reset Your Password</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring focus:ring-black"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-900 transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-gray-600 hover:text-black">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
