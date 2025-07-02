import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function DemoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      // Store demo user in localStorage
      localStorage.setItem('classboom_demo_user', JSON.stringify({
        id: 'demo-user-123',
        email: 'demo@classboom.edu',
        full_name: 'Demo User',
        school_name: 'ClassBoom Demo School',
        role: 'admin'
      }));
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ClassBoom Demo</h1>
            <p className="text-gray-600">Experience ClassBoom without signing up</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Supabase email validation is currently blocking signups. 
              Use this demo mode to explore ClassBoom features.
            </p>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              'Enter Demo Mode'
            )}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">To fix the signup issue:</p>
            <ol className="text-left space-y-1">
              <li>1. Go to Supabase Dashboard</li>
              <li>2. Navigate to Authentication → Providers</li>
              <li>3. Enable "Email" provider</li>
              <li>4. Turn ON "Confirm email" option</li>
            </ol>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}