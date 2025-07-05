import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeSettings } from './ThemeSettings';
import { SchoolSettings } from '../components/SchoolSettings';
import { 
  HiOutlineColorSwatch,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

const tabs = [
  { id: 'theme', label: 'Appearance', icon: HiOutlineColorSwatch },
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
  { id: 'school', label: 'School Settings', icon: HiOutlineOfficeBuilding },
  { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
  { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
  { id: 'billing', label: 'Billing', icon: HiOutlineCreditCard },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('theme');

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64"
        >
          <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-left
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-classboom-primary to-classboom-primary/80 text-white shadow-lg' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex-1"
        >
          {activeTab === 'theme' && <ThemeSettings />}
          
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Profile settings coming soon...</p>
            </div>
          )}
          
          {activeTab === 'school' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">School Settings</h2>
              <SchoolSettings />
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Notification Preferences</h2>
              <p className="text-gray-600 dark:text-gray-400">Notification settings coming soon...</p>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Security Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Security settings coming soon...</p>
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Billing & Subscription</h2>
              <p className="text-gray-600 dark:text-gray-400">Billing settings coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}