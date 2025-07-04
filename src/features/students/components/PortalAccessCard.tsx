import { useState } from 'react';
import { motion } from 'framer-motion';
import { StudentService } from '../services/studentService';
import { useToast } from '../../../context/ToastContext';
import { 
  HiOutlineMail,
  HiOutlineKey,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineRefresh,
  HiOutlineBan
} from 'react-icons/hi';
import type { Student } from '../types/student.types';

interface PortalAccessCardProps {
  student: Student;
  onUpdate?: () => void;
}

export function PortalAccessCard({ student, onUpdate }: PortalAccessCardProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const getPortalStatus = () => {
    if (student.account_created_at) {
      return {
        status: 'active',
        label: 'Active',
        icon: HiOutlineCheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30'
      };
    } else if (student.invite_sent_at && student.can_login) {
      // Check if invitation expired (48 hours)
      const sentAt = new Date(student.invite_sent_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 48) {
        return {
          status: 'expired',
          label: 'Invitation Expired',
          icon: HiOutlineExclamation,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30'
        };
      }
      
      return {
        status: 'invited',
        label: 'Invitation Sent',
        icon: HiOutlineClock,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
      };
    } else if (!student.can_login && student.user_id) {
      return {
        status: 'disabled',
        label: 'Access Revoked',
        icon: HiOutlineBan,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30'
      };
    } else {
      return {
        status: 'not_invited',
        label: 'Not Invited',
        icon: HiOutlineKey,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-900/30'
      };
    }
  };

  const handleSendInvitation = async () => {
    if (!student.email) {
      showToast('Student email is required to send invitation', 'error');
      return;
    }

    setLoading(true);
    try {
      await StudentService.inviteStudent(student.id);
      showToast('Portal invitation sent successfully!', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    setLoading(true);
    try {
      await StudentService.resendInvitation(student.id);
      showToast('Invitation resent successfully!', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to resend invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!confirm('Are you sure you want to revoke portal access for this student?')) {
      return;
    }

    setLoading(true);
    try {
      await StudentService.revokePortalAccess(student.id);
      showToast('Portal access revoked', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to revoke access', 'error');
    } finally {
      setLoading(false);
    }
  };

  const portalStatus = getPortalStatus();
  const StatusIcon = portalStatus.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Portal Access
      </h3>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${portalStatus.bgColor} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${portalStatus.color}`} />
            </div>
            <div>
              <p className={`font-medium ${portalStatus.color}`}>
                {portalStatus.label}
              </p>
              {student.invite_sent_at && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Invited {new Date(student.invite_sent_at).toLocaleDateString()}
                </p>
              )}
              {student.account_created_at && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Activated {new Date(student.account_created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Email Display */}
        {student.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <HiOutlineMail className="w-4 h-4" />
            <span>{student.email}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {portalStatus.status === 'not_invited' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendInvitation}
              disabled={loading || !student.email}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                font-medium text-sm shadow hover:shadow-lg transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <HiOutlineMail className="w-4 h-4" />
              <span>Send Portal Invitation</span>
            </motion.button>
          )}

          {(portalStatus.status === 'invited' || portalStatus.status === 'expired') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResendInvitation}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg
                font-medium text-sm shadow hover:shadow-lg transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              <span>Resend Invitation</span>
            </motion.button>
          )}

          {(portalStatus.status === 'active' || portalStatus.status === 'invited') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRevokeAccess}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg
                font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <HiOutlineBan className="w-4 h-4" />
              <span>Revoke Access</span>
            </motion.button>
          )}

          {portalStatus.status === 'disabled' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendInvitation}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg
                font-medium text-sm shadow hover:shadow-lg transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              <span>Re-enable Access</span>
            </motion.button>
          )}
        </div>

        {/* Help Text */}
        {!student.email && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            <HiOutlineExclamation className="inline w-4 h-4 mr-1" />
            Student email is required to enable portal access
          </p>
        )}
      </div>
    </div>
  );
}