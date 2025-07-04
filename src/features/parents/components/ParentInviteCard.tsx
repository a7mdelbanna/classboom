import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParentService } from '../services/parentService';
import { useToast } from '../../../context/ToastContext';
import { supabase } from '../../../lib/supabase';
import { 
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi';
import type { Student } from '../../students/types/student.types';

interface ParentInviteCardProps {
  student: Student;
  onUpdate?: () => void;
}

export function ParentInviteCard({ student, onUpdate }: ParentInviteCardProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invitedParents, setInvitedParents] = useState<any[]>([]);
  const [inviteData, setInviteData] = useState({
    parentEmail: '',
    parentName: '',
    relationship: 'father' as 'father' | 'mother' | 'guardian'
  });

  // Load invited parents from database
  useEffect(() => {
    loadInvitedParents();
  }, [student.id]);

  const loadInvitedParents = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_student_relationships')
        .select(`
          relationship_type,
          parents!inner(
            id,
            name,
            email,
            invite_sent_at,
            account_created_at
          )
        `)
        .eq('student_id', student.id);

      if (!error && data) {
        setInvitedParents(data);
      }
    } catch (error) {
      console.error('Error loading invited parents:', error);
    }
  };

  // Get existing parent info from student data
  const getExistingParents = () => {
    const parents = [];
    if (student.parent_info?.father_name) {
      parents.push({
        name: student.parent_info.father_name,
        email: student.parent_info.father_email,
        phone: student.parent_info.father_phone,
        relationship: 'father'
      });
    }
    if (student.parent_info?.mother_name) {
      parents.push({
        name: student.parent_info.mother_name,
        email: student.parent_info.mother_email,
        phone: student.parent_info.mother_phone,
        relationship: 'mother'
      });
    }
    return parents;
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData.parentEmail) {
      showToast('Parent email is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await ParentService.inviteParent({
        studentId: student.id,
        parentEmail: inviteData.parentEmail,
        parentName: inviteData.parentName,
        relationship: inviteData.relationship
      });
      
      showToast('Parent invitation sent successfully!', 'success');
      setShowInviteForm(false);
      setInviteData({ parentEmail: '', parentName: '', relationship: 'father' });
      await loadInvitedParents(); // Reload invited parents
      onUpdate?.(); // Reload student data
    } catch (error: any) {
      showToast(error.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickInvite = async (parentInfo: any) => {
    if (!parentInfo.email) {
      showToast('Parent email is required to send invitation', 'error');
      return;
    }

    setLoading(true);
    try {
      await ParentService.inviteParent({
        studentId: student.id,
        parentEmail: parentInfo.email,
        parentName: parentInfo.name,
        relationship: parentInfo.relationship
      });
      
      showToast(`Invitation sent to ${parentInfo.name}!`, 'success');
      await loadInvitedParents(); // Reload invited parents
      onUpdate?.(); // Reload student data
    } catch (error: any) {
      showToast(error.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const existingParents = getExistingParents();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <HiOutlineUsers className="w-5 h-5 mr-2" />
        Parent Portal Access
      </h3>

      <div className="space-y-4">
        {/* Invited Parents from Database */}
        {invitedParents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Invited Parents
            </h4>
            <div className="space-y-3">
              {invitedParents.map((rel, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {rel.parents.name || 'Unnamed Parent'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {rel.relationship_type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <HiOutlineMail className="w-3 h-3 mr-1" />
                      {rel.parents.email}
                    </p>
                  </div>
                  <div className="text-right">
                    {rel.parents.account_created_at ? (
                      <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
                        <HiOutlineCheckCircle className="w-4 h-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                        <HiOutlineClock className="w-4 h-4 mr-1" />
                        Invited
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Parents from Student Data */}
        {existingParents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Parent Information (from student record)
            </h4>
            <div className="space-y-3">
              {existingParents.map((parent, index) => {
                // Check if this parent is already invited
                const isInvited = invitedParents.some(rel => 
                  rel.parents.email === parent.email
                );
                
                return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {parent.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {parent.relationship}
                    </p>
                    {parent.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <HiOutlineMail className="w-3 h-3 mr-1" />
                        {parent.email}
                      </p>
                    )}
                  </div>
                  {parent.email && !isInvited && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickInvite(parent)}
                      disabled={loading}
                      className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg
                        text-sm font-medium shadow hover:shadow-lg transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Invite
                    </motion.button>
                  )}
                  {isInvited && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Already Invited
                    </span>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual Invite Form */}
        {!showInviteForm ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteForm(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed 
              border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500
              transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <HiOutlineUserAdd className="w-5 h-5" />
            <span>Invite Another Parent</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Invite Parent to Portal
            </h4>
            
            <form onSubmit={handleSendInvitation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Email *
                </label>
                <input
                  type="email"
                  value={inviteData.parentEmail}
                  onChange={(e) => setInviteData(prev => ({ ...prev, parentEmail: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 text-gray-900 dark:text-white text-sm"
                  placeholder="parent@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Name
                </label>
                <input
                  type="text"
                  value={inviteData.parentName}
                  onChange={(e) => setInviteData(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 text-gray-900 dark:text-white text-sm"
                  placeholder="Parent's full name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relationship
                </label>
                <select
                  value={inviteData.relationship}
                  onChange={(e) => setInviteData(prev => ({ ...prev, relationship: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all duration-200 text-gray-900 dark:text-white text-sm"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg
                    text-sm font-medium shadow hover:shadow-lg transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </motion.button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteData({ parentEmail: '', parentName: '', relationship: 'father' });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg
                    text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Parents will receive an email with activation instructions and will need 
            the student code "{student.student_code}" to link their account to this student.
          </p>
        </div>
      </div>
    </div>
  );
}