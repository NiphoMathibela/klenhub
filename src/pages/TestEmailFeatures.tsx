import React, { useState } from 'react';
import { authService } from '../services/api';

const TestEmailFeatures: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testType, setTestType] = useState<'verification' | 'reset'>('verification');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (testType === 'verification') {
        await authService.resendVerificationEmail();
        setMessage('Verification email sent. Please check your inbox.');
      } else {
        await authService.forgotPassword(email);
        setMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Test Email Features</h1>
      
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
      
      <div className="mb-4">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setTestType('verification')}
            className={`px-4 py-2 rounded ${
              testType === 'verification' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Email Verification
          </button>
          <button
            type="button"
            onClick={() => setTestType('reset')}
            className={`px-4 py-2 rounded ${
              testType === 'reset' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Password Reset
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {testType === 'reset' && (
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isSubmitting 
            ? 'Sending...' 
            : testType === 'verification' 
              ? 'Send Verification Email' 
              : 'Send Reset Password Email'}
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Testing Instructions:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>For email verification, you must be logged in. The system will send a verification email to your registered email address.</li>
          <li>For password reset, enter your email address and the system will send a password reset link.</li>
          <li>Check your email inbox at <strong>info@klenhub.co.za</strong> to verify the emails are being received.</li>
          <li>Follow the links in the emails to complete the verification or reset process.</li>
        </ol>
      </div>
    </div>
  );
};

export default TestEmailFeatures;
