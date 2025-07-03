import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/context/AuthContext';
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
  HiOutlineCalendar
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
  children?: MenuItem[];
}

export function Sidebar({ collapsed, onToggle, isMobile }: SidebarProps) {
  const location = useLocation();
  const { schoolInfo } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['students']);

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
          path: '/students/new'
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
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item: MenuItem) => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isParentActive(item);

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
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                : 'hover:bg-white/50 text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
              <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} ${active ? 'text-white' : 'text-gray-600'}`} />
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
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
            : 'hover:bg-white/50 text-gray-700 hover:text-gray-900'
          }
        `}
      >
        <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
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
          bg-white/80 backdrop-blur-xl border-r border-gray-200/50
          shadow-xl
        `}
      >
        {/* Header */}
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 border-b border-gray-200/50`}>
          {!collapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 
                bg-clip-text text-transparent"
            >
              ClassBoom
            </motion.h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <HiMenuAlt2 className="w-6 h-6 text-gray-600" />
            ) : (
              <HiX className="w-5 h-5 text-gray-600" />
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
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}