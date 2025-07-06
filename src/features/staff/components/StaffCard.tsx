import { motion } from 'framer-motion';
import type { Staff } from '../types/staff.types';
import { 
  HiOutlinePhone, 
  HiOutlineMail, 
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineIdentification,
  HiOutlineUserGroup,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLink,
  HiOutlineRefresh,
  HiOutlineClock
} from 'react-icons/hi';

interface StaffCardProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  onSendInvitation: (staff: Staff) => void;
  onEditAvailability?: (staff: Staff) => void;
  getRoleIcon: (role: string) => string;
  getStatusColor: (status: string) => string;
}

export function StaffCard({ 
  staff, 
  onEdit, 
  onDelete, 
  onSendInvitation, 
  onEditAvailability,
  getRoleIcon, 
  getStatusColor 
}: StaffCardProps) {
  
  const formatSalary = () => {
    if (!staff.compensation_model || staff.compensation_model === 'volunteer') {
      return 'Volunteer';
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

  const getEmploymentTypeColor = (type?: string) => {
    switch (type) {
      case 'full_time': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'part_time': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'contract': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
      case 'volunteer': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const formatEmploymentType = (type?: string) => {
    if (!type) return 'Not set';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 cursor-pointer"
      onClick={() => onEdit(staff)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
            {staff.avatar_url ? (
              <img 
                src={staff.avatar_url} 
                alt={staff.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              staff.first_name.charAt(0) + staff.last_name.charAt(0)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {staff.full_name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getRoleIcon(staff.role)} {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
              </span>
              {staff.department && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                  {staff.department}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-3">
          <span className={`text-sm font-medium whitespace-nowrap ${getStatusColor(staff.status)}`}>
            {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getEmploymentTypeColor(staff.employment_type)}`}>
            {formatEmploymentType(staff.employment_type)}
          </span>
        </div>
      </div>

      {/* Staff Code */}
      <div className="flex items-center space-x-2 mb-3">
        <HiOutlineIdentification className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
          {staff.staff_code}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <HiOutlineMail className="w-4 h-4" />
          <span className="truncate">{staff.email}</span>
        </div>
        {staff.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <HiOutlinePhone className="w-4 h-4" />
            <span>{staff.phone}</span>
          </div>
        )}
      </div>

      {/* Employment Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <HiOutlineCalendar className="w-4 h-4" />
          <span>Hired: {new Date(staff.hire_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <HiOutlineCurrencyDollar className="w-4 h-4" />
          <span>{formatSalary()}</span>
        </div>
      </div>

      {/* Specializations */}
      {staff.specializations && staff.specializations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            <HiOutlineUserGroup className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Specializations</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {staff.specializations.slice(0, 3).map((spec, index) => (
              <span 
                key={index}
                className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
            {staff.specializations.length > 3 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                +{staff.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Portal Status */}
      <div className="mb-4">
        {staff.portal_access_enabled ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 dark:text-green-300 font-medium">Portal Active</span>
              {staff.last_login_at && (
                <span className="text-green-600 dark:text-green-400">
                  • Last login: {new Date(staff.last_login_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ) : staff.can_login && staff.invite_sent_at ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Invitation Sent</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {new Date(staff.invite_sent_at).toLocaleDateString()}
                </span>
              </div>
              {(() => {
                const sentAt = new Date(staff.invite_sent_at);
                const now = new Date();
                const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
                const hoursRemaining = 48 - hoursDiff;
                
                if (hoursRemaining <= 0) {
                  return (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Expired
                    </span>
                  );
                } else if (hoursRemaining < 24) {
                  return (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      Expires in {Math.floor(hoursRemaining)}h
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">No Portal Access</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(staff);
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            title="Edit Staff"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </motion.button>
          
          {onEditAvailability && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onEditAvailability(staff);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="Edit Availability"
            >
              <HiOutlineClock className="w-4 h-4" />
            </motion.button>
          )}
          
          {!staff.can_login && !staff.invite_sent_at && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onSendInvitation(staff);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Send Portal Invitation"
            >
              <HiOutlineLink className="w-4 h-4" />
            </motion.button>
          )}
          
          {staff.can_login && staff.invite_sent_at && !staff.portal_access_enabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onSendInvitation(staff);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Resend Portal Invitation"
            >
              <HiOutlineRefresh className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(staff);
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Staff"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Added {new Date(staff.created_at).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}