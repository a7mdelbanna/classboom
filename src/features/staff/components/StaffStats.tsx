import { motion } from 'framer-motion';
import { 
  HiOutlineUsers, 
  HiOutlineUserGroup, 
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

interface StaffStatsProps {
  stats: {
    total: number;
    active: number;
    teachers: number;
    managers: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    byEmploymentType: Record<string, number>;
  };
}

export function StaffStats({ stats }: StaffStatsProps) {
  const statCards = [
    {
      title: 'Total Staff',
      value: stats.total,
      icon: HiOutlineUsers,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Active Staff',
      value: stats.active,
      icon: HiOutlineCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Teachers',
      value: stats.teachers,
      icon: HiOutlineAcademicCap,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300'
    },
    {
      title: 'Managers',
      value: stats.managers,
      icon: HiOutlineBriefcase,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  ];

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

  const getEmploymentTypeIcon = (type: string) => {
    switch (type) {
      case 'full_time': return '🕘';
      case 'part_time': return '⏰';
      case 'contract': return '📄';
      case 'volunteer': return '❤️';
      default: return '💼';
    }
  };

  const formatEmploymentType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <HiOutlineUserGroup className="w-5 h-5 mr-2 text-blue-500" />
            By Role
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getRoleIcon(role)}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {role.replace('_', ' ')}s
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {count}
                  </span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* By Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <HiOutlineCheckCircle className="w-5 h-5 mr-2 text-green-500" />
            By Status
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'active': return 'bg-green-500';
                  case 'inactive': return 'bg-gray-500';
                  case 'suspended': return 'bg-yellow-500';
                  case 'terminated': return 'bg-red-500';
                  default: return 'bg-gray-500';
                }
              };

              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'active': return '✅';
                  case 'inactive': return '⏸️';
                  case 'suspended': return '⚠️';
                  case 'terminated': return '❌';
                  default: return '❓';
                }
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStatusIcon(status)}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {count}
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${getStatusColor(status)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* By Employment Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <HiOutlineBriefcase className="w-5 h-5 mr-2 text-purple-500" />
            Employment Type
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byEmploymentType).map(([type, count]) => {
              const getTypeColor = (type: string) => {
                switch (type) {
                  case 'full_time': return 'bg-green-500';
                  case 'part_time': return 'bg-blue-500';
                  case 'contract': return 'bg-purple-500';
                  case 'volunteer': return 'bg-orange-500';
                  default: return 'bg-gray-500';
                }
              };

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getEmploymentTypeIcon(type)}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatEmploymentType(type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {count}
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${getTypeColor(type)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <HiOutlineExclamationCircle className="w-5 h-5 mr-2 text-orange-500" />
            Quick Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-700 dark:text-gray-300">
                {((stats.active / stats.total) * 100).toFixed(1)}% of staff are active
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700 dark:text-gray-300">
                {((stats.teachers / stats.total) * 100).toFixed(1)}% are teachers
              </span>
            </div>
            {stats.byEmploymentType.full_time && (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  {((stats.byEmploymentType.full_time / stats.total) * 100).toFixed(1)}% are full-time
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}