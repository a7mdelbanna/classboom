import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Modal } from '../Modal';
import { AddStudentNew } from '../../features/students/pages/AddStudentNew';
import { 
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineCog,
  HiChevronDown,
  HiMenuAlt2,
  HiX,
  HiOutlinePlus,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineCash,
  HiOutlineLibrary
} from 'react-icons/hi';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  action?: () => void;
  children?: MenuItem[];
}

export function Sidebar({ collapsed, onToggle, isMobile }: SidebarProps) {
  const location = useLocation();
  const { schoolInfo } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['students', 'courses', 'enrollments', 'staff']);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Get terminology from school settings
  const terminology = schoolInfo?.settings?.terminology || {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    class: 'Class',
    classes: 'Classes',
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HiOutlineHome,
      path: '/dashboard'
    },
    {
      id: 'students',
      label: terminology.students,
      icon: HiOutlineUserGroup,
      children: [
        {
          id: 'students-all',
          label: 'View All',
          icon: HiOutlineClipboardList,
          path: '/students'
        },
        {
          id: 'students-add',
          label: 'Add New',
          icon: HiOutlinePlus,
          action: () => setShowAddStudentModal(true)
        },
        {
          id: 'students-reports',
          label: 'Reports',
          icon: HiOutlineDocumentReport,
          path: '/students/reports'
        }
      ]
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: HiOutlineBookOpen,
      children: [
        {
          id: 'courses-catalog',
          label: 'Catalog',
          icon: HiOutlineClipboardList,
          path: '/courses'
        },
        {
          id: 'courses-create',
          label: 'Add Course',
          icon: HiOutlinePlus,
          action: () => {
            // Navigate to courses page and trigger add modal
            if (location.pathname !== '/courses') {
              window.location.href = '/courses?action=add';
            } else {
              // If already on courses page, just trigger the add course function
              // We'll need to implement this via a custom event or context
              window.dispatchEvent(new CustomEvent('openAddCourseModal'));
            }
          }
        }
      ]
    },
    {
      id: 'enrollments',
      label: 'Enrollments',
      icon: HiOutlineClipboardCheck,
      children: [
        {
          id: 'enrollments-all',
          label: 'View All',
          icon: HiOutlineClipboardList,
          path: '/enrollments'
        },
        {
          id: 'enrollments-add',
          label: 'Add Enrollment',
          icon: HiOutlinePlus,
          action: () => {
            // Navigate to enrollments page and trigger add modal
            if (location.pathname !== '/enrollments') {
              window.location.href = '/enrollments?action=add';
            } else {
              // If already on enrollments page, trigger the add enrollment modal
              window.dispatchEvent(new CustomEvent('openAddEnrollmentModal'));
            }
          }
        }
      ]
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: HiOutlineBriefcase,
      children: [
        {
          id: 'staff-all',
          label: 'View All',
          icon: HiOutlineClipboardList,
          path: '/staff'
        },
        {
          id: 'staff-add',
          label: 'Add Staff',
          icon: HiOutlinePlus,
          action: () => {
            // Navigate to staff page and trigger add modal
            if (location.pathname !== '/staff') {
              window.location.href = '/staff?action=add';
            } else {
              // If already on staff page, trigger the add staff modal
              window.dispatchEvent(new CustomEvent('openAddStaffModal'));
            }
          }
        },
        {
          id: 'staff-reports',
          label: 'Reports',
          icon: HiOutlineDocumentReport,
          path: '/staff/reports'
        }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: HiOutlineCash,
      path: '/payroll'
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: HiOutlineLibrary,
      path: '/financial'
    },
    {
      id: 'classes',
      label: terminology.classes,
      icon: HiOutlineAcademicCap,
      children: [
        {
          id: 'classes-all',
          label: 'View All',
          icon: HiOutlineClipboardList,
          path: '/classes'
        },
        {
          id: 'classes-create',
          label: 'Create New',
          icon: HiOutlinePlus,
          path: '/classes/new'
        },
        {
          id: 'classes-schedule',
          label: 'Schedule',
          icon: HiOutlineCalendar,
          path: '/classes/schedule'
        }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: HiOutlineCurrencyDollar,
      path: '/payments'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: HiOutlineChartBar,
      path: '/analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: HiOutlineCog,
      path: '/settings'
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    // For exact path matching (to avoid both catalog and add course being active)
    if (path.includes('?')) {
      // For paths with query params, only match if URL params also match
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem) => {
    // Only highlight parent if it has its own path and is active
    // Don't highlight parent just because a child is active
    if (item.path && isActive(item.path)) return true;
    return false;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = depth === 0 ? isParentActive(item) : isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => {
              if (collapsed) {
                // When sidebar is collapsed, clicking a parent item should expand the sidebar
                onToggle();
                // Also expand the menu item
                if (!isExpanded) {
                  toggleExpanded(item.id);
                }
              } else {
                toggleExpanded(item.id);
              }
            }}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
              px-3 py-2.5 rounded-lg
              transition-all duration-200 group relative
              ${active 
                ? 'bg-gradient-to-r from-orange-500 to-orange-500/80 text-white shadow-lg' 
                : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
              <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${active ? 'text-white' : ''}`} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </div>
            {!collapsed && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <HiChevronDown className="w-4 h-4" />
              </motion.div>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md 
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </button>

          {/* Children */}
          <AnimatePresence>
            {!collapsed && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1">
                  {item.children?.map(child => renderMenuItem(child, depth + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (item.action) {
      return (
        <button
          key={item.id}
          onClick={item.action}
          className={`
            w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} 
            px-3 py-2.5 rounded-lg
            transition-all duration-200 group relative
            ${depth > 0 && !collapsed ? 'text-sm' : ''}
            hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
          `}
        >
          <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
          {!collapsed && (
            <span className="font-medium text-left">{item.label}</span>
          )}
          
          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md 
              opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {item.label}
            </div>
          )}
        </button>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path || '#'}
        className={({ isActive }) => `
          flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} 
          px-3 py-2.5 rounded-lg
          transition-all duration-200 group relative
          ${depth > 0 && !collapsed ? 'text-sm' : ''}
          ${isActive 
            ? 'bg-gradient-to-r from-orange-500 to-orange-500/80 text-white shadow-lg' 
            : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }
        `}
      >
        <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${location.pathname === item.path ? 'text-white' : ''}`} />
        {!collapsed && (
          <span className="font-medium">{item.label}</span>
        )}
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md 
            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isMobile ? '100%' : collapsed ? '4rem' : '16rem',
          x: isMobile && collapsed ? '-100%' : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-0 left-0 h-full z-40
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50
          shadow-xl
        `}
      >
        {/* Header */}
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 border-b border-gray-200/50 dark:border-gray-700/50`}>
          {!collapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent"
            >
              ClassBoom
            </motion.h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          >
            {collapsed ? (
              <HiMenuAlt2 className="w-6 h-6" />
            ) : (
              <HiX className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className={`${collapsed ? 'px-2' : 'px-4'} py-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]`}>
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title={`Add New ${terminology.student}`}
        size="xl"
      >
        <AddStudentNew 
          onSuccess={() => {
            setShowAddStudentModal(false);
            // Activities will refresh automatically via the dashboard
          }}
          onCancel={() => setShowAddStudentModal(false)}
          isModal={true}
        />
      </Modal>
    </>
  );
}