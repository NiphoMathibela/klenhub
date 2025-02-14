import React from 'react';

const Login: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-6">LOGIN</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter your email"
              required
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
            />
          </div>

          <div className='py-4'>
            <p className='text-gray-700'>Don't have an account? <span className='text-black font-bold cursor-pointer'>REGISTER</span></p>
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
