import type { ColumnMapping } from '../types/import.types';
import { getSystemFields } from '../utils/importUtils';
import { CustomSelect } from '../../../components/CustomSelect';
import { HiOutlineInformationCircle } from 'react-icons/hi';

interface ColumnMapperProps {
  headers: string[];
  mappings: ColumnMapping[];
  onMappingUpdate: (mappings: ColumnMapping[]) => void;
  sampleData: any[];
}

export function ColumnMapper({ headers, mappings, onMappingUpdate, sampleData }: ColumnMapperProps) {
  const systemFields = getSystemFields();

  const handleMappingChange = (csvColumn: string, systemField: string) => {
    const newMappings = mappings.map(mapping =>
      mapping.csvColumn === csvColumn
        ? { ...mapping, systemField: systemField as any }
        : mapping
    );
    onMappingUpdate(newMappings);
  };

  const getMappedFieldsCount = () => {
    return mappings.filter(m => m.systemField !== 'ignore').length;
  };

  const hasRequiredFields = () => {
    const mappedFields = mappings
      .filter(m => m.systemField !== 'ignore')
      .map(m => m.systemField);
    return mappedFields.includes('first_name') && mappedFields.includes('last_name');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Map Columns</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Match your CSV columns to the system fields. Required fields are marked with *
        </p>
      </div>

      {/* Mapping Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {getMappedFieldsCount()} of {headers.length} columns mapped
            </span>
          </div>
          {!hasRequiredFields() && (
            <span className="text-sm text-red-600 dark:text-red-400">
              Missing required fields: First Name, Last Name
            </span>
          )}
        </div>
      </div>

      {/* Column Mappings */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {headers.map((header, index) => {
          const currentMapping = mappings.find(m => m.csvColumn === header);
          const sampleValues = sampleData.map(row => row[header]).filter(Boolean);
          
          return (
            <div key={header} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CSV Column Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CSV Column
                  </label>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{header}</p>
                    {sampleValues.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Sample: {sampleValues.slice(0, 3).join(', ')}
                        {sampleValues.length > 3 && '...'}
                      </p>
                    )}
                  </div>
                </div>

                {/* System Field Mapping */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maps To
                  </label>
                  <CustomSelect
                    value={currentMapping?.systemField || 'ignore'}
                    onChange={(value) => handleMappingChange(header, value)}
                    options={systemFields.map(field => ({
                      value: field.value,
                      label: field.required ? `${field.label} *` : field.label
                    }))}
                    placeholder="Select field..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tips:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
          <li>We've automatically mapped columns based on common naming patterns</li>
          <li>Review and adjust the mappings as needed</li>
          <li>Use "Ignore this column" for columns you don't want to import</li>
          <li>Dates should be in YYYY-MM-DD format</li>
          <li>Comma-separate multiple values for allergies and medications</li>
        </ul>
      </div>
    </div>
  );
}