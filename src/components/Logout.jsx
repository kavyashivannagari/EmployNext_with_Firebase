import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../lib/firebase';

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      // After successful logout, navigate to home
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      // You could add error handling UI here if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default Logout;