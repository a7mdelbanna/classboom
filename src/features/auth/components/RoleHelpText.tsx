import { motion } from 'framer-motion';
import { HiOutlineInformationCircle } from 'react-icons/hi';

interface RoleHelpTextProps {
  selectedRole: string;
}

export function RoleHelpText({ selectedRole }: RoleHelpTextProps) {
  const helpText: Record<string, string> = {
    school: 'For school administrators and owners only. If you are a teacher or staff member, please select "Staff/Teacher".',
    staff: 'For teachers and staff members with portal access. You must have received an invitation from your school administrator.',
    student: 'For students with portal access. You must have received an invitation from your school.',
    parent: 'For parents/guardians. You must have received an invitation or have a student code.'
  };

  if (!selectedRole || !helpText[selectedRole]) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-start space-x-2">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {helpText[selectedRole]}
        </p>
      </div>
    </motion.div>
  );
}