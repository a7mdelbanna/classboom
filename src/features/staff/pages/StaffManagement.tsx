import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { StaffService } from '../services/staffService';
import { StaffModal } from '../components/StaffModal';
import { StaffCard } from '../components/StaffCard';
import { StaffFilters } from '../components/StaffFilters';
import { StaffStats } from '../components/StaffStats';
import AvailabilityEditModal from '../components/AvailabilityEditModal';
import type { Staff, StaffFilters as StaffFiltersType } from '../types/staff.types';
import { 
  HiOutlineUserAdd, 
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineFilter
} from 'react-icons/hi';

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityStaff, setAvailabilityStaff] = useState<Staff | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StaffFiltersType>({});
  const [stats, setStats] = useState<any>(null);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadData();
  }, [filters]);

  // Handle URL parameter for opening add modal
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleAddStaff();
      // Clear the URL parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Handle custom event for opening add modal
  useEffect(() => {
    const handleOpenModal = () => {
      handleAddStaff();
    };

    window.addEventListener('openAddStaffModal', handleOpenModal);
    return () => {
      window.removeEventListener('openAddStaffModal', handleOpenModal);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, statsData] = await Promise.all([
        StaffService.getStaff(filters),
        StaffService.getStaffStats()
      ]);
      
      setStaff(staffData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading staff data:', error);
      showToast(error.message || 'Failed to load staff data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    if (!confirm(`Are you sure you want to delete ${staffMember.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await StaffService.deleteStaff(staffMember.id);
      showToast(`${staffMember.full_name} has been deleted`, 'success');
      loadData();
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      showToast(error.message || 'Failed to delete staff member', 'error');
    }
  };

  const handleSendInvitation = async (staffMember: Staff) => {
    try {
      await StaffService.sendPortalInvitation(staffMember.id);
      showToast(`Portal invitation sent to ${staffMember.email}`, 'success');
      loadData();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      showToast(error.message || 'Failed to send invitation', 'error');
    }
  };

  const handleEditAvailability = (staffMember: Staff) => {
    setAvailabilityStaff(staffMember);
    setShowAvailabilityModal(true);
  };

  const handleAvailabilitySave = (updatedStaff: Staff) => {
    // Update the staff in the local state
    setStaff(currentStaff => 
      currentStaff.map(s => s.id === updatedStaff.id ? updatedStaff : s)
    );
    showToast(`Availability updated for ${updatedStaff.full_name}`, 'success');
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingStaff(null);
    loadData();
  };

  const handleFiltersChange = (newFilters: StaffFiltersType) => {
    setFilters(newFilters);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return '👨‍🏫';
      case 'manager': return '👩‍💼';
      case 'admin': return '⚙️';
      case 'support': return '🛠️';
      case 'custodian': return '🧹';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'inactive': return 'text-gray-600 dark:text-gray-400';
      case 'suspended': return 'text-yellow-600 dark:text-yellow-400';
      case 'terminated': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HiOutlineUsers className="w-6 h-6 text-orange-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <HiOutlineFilter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleAddStaff}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <HiOutlineUserAdd className="w-4 h-4 mr-2" />
                Add Staff
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <StaffStats stats={stats} />
          </motion.div>
        )}

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <StaffFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                staffData={staff}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff Grid */}
        <div className="space-y-6">
          {staff.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <HiOutlineUsers className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No staff members found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {Object.keys(filters).length > 0 
                  ? 'Try adjusting your filters or add your first staff member.'
                  : 'Get started by adding your first staff member.'
                }
              </p>
              <button
                onClick={handleAddStaff}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add First Staff Member
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((staffMember, index) => (
                <motion.div
                  key={staffMember.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <StaffCard
                    staff={staffMember}
                    onEdit={handleEditStaff}
                    onDelete={handleDeleteStaff}
                    onSendInvitation={handleSendInvitation}
                    onEditAvailability={handleEditAvailability}
                    getRoleIcon={getRoleIcon}
                    getStatusColor={getStatusColor}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Staff Modal */}
      <StaffModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleModalSave}
        staff={editingStaff}
      />

      {/* Availability Edit Modal */}
      {showAvailabilityModal && availabilityStaff && (
        <AvailabilityEditModal
          staff={availabilityStaff}
          onClose={() => {
            setShowAvailabilityModal(false);
            setAvailabilityStaff(null);
          }}
          onSave={handleAvailabilitySave}
        />
      )}
    </div>
  );
}