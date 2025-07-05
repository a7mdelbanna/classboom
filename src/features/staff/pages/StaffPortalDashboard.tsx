import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { StaffService } from '../services/staffService';
import { useToast } from '../../../context/ToastContext';
import type { Staff } from '../types/staff.types';
import { 
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineLogout,
  HiOutlineCog
} from 'react-icons/hi';

export function StaffPortalDashboard() {
  const { user, staffInfo, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, [staffInfo]);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      
      // First check if we have staffInfo from AuthContext
      if (staffInfo) {
        console.log('Using staffInfo from AuthContext');
        // Load full staff data including school info
        const staffData = await StaffService.getStaffMember(staffInfo.id);
        setStaff(staffData);
      } else if (user?.id) {
        console.log('Falling back to load by user_id');
        // Fallback: Find staff member by user_id
        const staffData = await StaffService.getStaffByUserId(user.id);
        setStaff(staffData);
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
      setStaff(null); // Set to null if there's an error
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = () => {
    if (!staff?.compensation_model || staff.compensation_model === 'volunteer') {
      return 'Volunteer Position';
    }
    
    const currency = staff.currency || 'USD';
    
    switch (staff.compensation_model) {
      case 'monthly_salary':
        return `${currency} ${staff.base_salary?.toLocaleString() || 0}/month`;
      case 'hourly':
        return `${currency} ${staff.hourly_rate || 0}/hour`;
      case 'per_session':
        return `${currency} ${staff.session_rate || 0}/session`;
      default:
        return 'Not set';
    }
  };

  const formatEmploymentType = (type?: string) => {
    if (!type) return 'Not specified';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Staff Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your staff profile could not be loaded. Please contact administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {staff.avatar_url ? (
                  <img 
                    src={staff.avatar_url} 
                    alt={staff.full_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  staff.first_name.charAt(0) + staff.last_name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome, {staff.first_name}!
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">
                  {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                  {staff.department && ` • ${staff.department}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Staff ID: {staff.staff_code}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => showToast('Settings coming soon!', 'info')}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Settings"
              >
                <HiOutlineCog className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <HiOutlineLogout className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center mb-6">
              <HiOutlineUser className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <HiOutlineMail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{staff.email}</p>
                </div>
              </div>
              
              {staff.phone && (
                <div className="flex items-center">
                  <HiOutlinePhone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white">{staff.phone}</p>
                  </div>
                </div>
              )}
              
              {staff.address && (
                <div className="flex items-start">
                  <HiOutlineLocationMarker className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white">
                      {staff.address.street}<br />
                      {staff.address.city}, {staff.address.state} {staff.address.postal_code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Employment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center mb-6">
              <HiOutlineBriefcase className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Employment
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <HiOutlineCalendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hire Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(staff.hire_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <HiOutlineClock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employment Type</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatEmploymentType(staff.employment_type)}
                  </p>
                </div>
              </div>
              
              {staff.specializations && staff.specializations.length > 0 && (
                <div className="flex items-start">
                  <HiOutlineAcademicCap className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Specializations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {staff.specializations.map((spec, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {staff.max_weekly_hours && (
                <div className="flex items-center">
                  <HiOutlineClock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Hours</p>
                    <p className="text-gray-900 dark:text-white">
                      {staff.min_weekly_hours || 0} - {staff.max_weekly_hours} hours
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Compensation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center mb-6">
              <HiOutlineCurrencyDollar className="w-6 h-6 text-green-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Compensation
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Compensation Model</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {staff.compensation_model?.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatSalary()}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Status: <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  For payroll inquiries, please contact HR or school administration.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left">
              <HiOutlineCalendar className="w-8 h-8 text-orange-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">My Schedule</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View your class schedule</p>
            </button>
            
            {/* Show courses for teachers and managers */}
            {(staffInfo?.role === 'teacher' || staffInfo?.role === 'manager' || staffInfo?.role === 'admin') && (
              <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
                <HiOutlineAcademicCap className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">My Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your courses</p>
              </button>
            )}
            
            <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
              <HiOutlineCurrencyDollar className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Payroll</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View payroll information</p>
            </button>
            
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
              <HiOutlineUser className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your profile</p>
            </button>

            {/* Admin/Manager specific actions */}
            {(staffInfo?.role === 'admin' || staffInfo?.role === 'manager') && (
              <>
                <button className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left">
                  <HiOutlineUsers className="w-8 h-8 text-red-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Staff Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage staff members</p>
                </button>
                
                <button className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left">
                  <HiOutlineDocumentReport className="w-8 h-8 text-indigo-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View analytics & reports</p>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}