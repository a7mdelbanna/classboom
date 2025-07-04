import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineDownload } from 'react-icons/hi';
import { generateSampleCSV } from '../utils/importUtils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUploader({ onFileSelect, isProcessing }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Student Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload a CSV or Excel file with student information
          </p>
        </div>
        <button
          type="button"
          onClick={downloadSampleCSV}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
        >
          <HiOutlineDownload className="w-4 h-4" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      <motion.div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        whileHover={{ scale: isProcessing ? 1 : 1.01 }}
        whileTap={{ scale: isProcessing ? 1 : 0.99 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <HiOutlineUpload className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {isDragActive 
                ? 'Drop the file here...' 
                : 'Drag & drop a file here, or click to select'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <HiOutlineDocumentText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">File Requirements:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>First row must contain column headers</li>
              <li>Required fields: First Name, Last Name</li>
              <li>Maximum 1000 students per import</li>
              <li>File size limit: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}