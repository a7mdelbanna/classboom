import type { ImportStudentData, ImportError } from '../types/import.types';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

interface ImportPreviewProps {
  data: ImportStudentData[];
  errors: ImportError[];
  terminology: any;
}

export function ImportPreview({ data, errors, terminology }: ImportPreviewProps) {
  const hasErrors = errors.length > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview Import Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review the data before importing. Scroll to see all {terminology.students.toLowerCase()}.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <HiOutlineCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Valid Records</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{data.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <HiOutlineExclamationCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Errors</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{errors.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400" />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total to Import</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Errors Display */}
      {hasErrors && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            Validation Errors (These rows will be skipped):
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600 dark:text-red-400">
                Row {error.row}: {error.message}
                {error.field && <span className="ml-1">({error.field})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Parent Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {data.slice(0, 10).map((student, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.first_name} {student.last_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.email || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.phone || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.date_of_birth || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {student.parent_name || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length > 10 && (
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Showing 10 of {data.length} {terminology.students.toLowerCase()}. All will be imported.
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">Before importing:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Duplicate {terminology.students.toLowerCase()} will be created if they already exist</li>
              <li>This action cannot be undone automatically</li>
              <li>Make sure all data is correct before proceeding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}