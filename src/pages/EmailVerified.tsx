import React from 'react';
import { Link } from 'react-router-dom';

const EmailVerified: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md text-center">
      <div className="mb-6 text-green-500">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 mx-auto" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Email Verified Successfully!</h1>
      
      <p className="text-gray-600 mb-6">
        Thank you for verifying your email address. Your account is now fully activated.
      </p>
      
      <div className="flex justify-center space-x-4">
        <Link 
          to="/login" 
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Log In
        </Link>
        
        <Link 
          to="/" 
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default EmailVerified;
