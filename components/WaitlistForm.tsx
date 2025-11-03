'use client';

import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Successfully joined the waitlist!');
        setIsSuccess(true);
        setEmail('');
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mb-6 sm:mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
          <input
            className="flex-1 bg-gray-50 rounded-full px-4 sm:px-6 py-3 placeholder-gray-500 text-sm sm:text-base font-sans focus:outline-none"
            style={{ 
              color: '#002903',
              border: '1px solid #d1d5db'
            }}
            onFocus={(e) => e.target.style.border = '2px solid #002903'}
            onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            className="text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#002903' }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#001a02')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#002903')}
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Waitlist →'}
          </button>
        </div>
      </form>
      
      {/* Status Message */}
      {message && (
        <div className={`text-sm mb-4 p-3 rounded-lg ${
          isSuccess 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      {/* Maker Avatars and Count */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          <img src="/Ellipse.png" alt="Maker Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
          <img src="/Ellipse (1).png" alt="Maker Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
          <img src="/Ellipse (2).png" alt="Maker Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
        </div>
        <span className="text-sm font-medium" style={{ color: '#002903' }}>163+ people have already joined</span>
      </div>
    </div>
  );
}
