import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../../components/Modal';
import { FileUploader } from './FileUploader';
import { ColumnMapper } from './ColumnMapper';
import { ImportPreview } from './ImportPreview';
import { ImportProgress } from './ImportProgress';
import { ImportResults } from './ImportResults';
import { parseCSVFile, parseExcelFile, validateImportData } from '../utils/importUtils';
import type { ImportState, ImportStep, ColumnMapping, ImportStudentData } from '../types/import.types';
import { StudentService } from '../services/studentService';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../auth/context/AuthContext';
import { HiOutlineArrowLeft, HiOutlineArrowRight } from 'react-icons/hi';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const { showToast } = useToast();
  const { schoolInfo } = useAuth();
  const [importState, setImportState] = useState<ImportState>({
    step: 'upload',
    fileName: '',
    fileData: [],
    headers: [],
    mappings: [],
    validatedData: [],
    errors: []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const terminology = schoolInfo?.settings?.terminology || {
    student: 'Student',
    students: 'Students'
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      let result;
      if (file.name.endsWith('.csv')) {
        result = await parseCSVFile(file);
      } else {
        result = await parseExcelFile(file);
      }

      if (result.data.length === 0) {
        showToast('File is empty', 'error');
        return;
      }

      if (result.data.length > 1000) {
        showToast('File contains more than 1000 rows. Please split into smaller files.', 'error');
        return;
      }

      // Auto-map common column names
      const autoMappings: ColumnMapping[] = result.headers.map(header => {
        const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Map common variations
        const fieldMap: { [key: string]: keyof ImportStudentData } = {
          'firstname': 'first_name',
          'fname': 'first_name',
          'lastname': 'last_name',
          'lname': 'last_name',
          'email': 'email',
          'emailaddress': 'email',
          'phone': 'phone',
          'phonenumber': 'phone',
          'mobile': 'phone',
          'dateofbirth': 'date_of_birth',
          'dob': 'date_of_birth',
          'birthdate': 'date_of_birth',
          'country': 'country',
          'city': 'city',
          'skilllevel': 'skill_level',
          'level': 'skill_level',
          'grade': 'grade',
          'notes': 'notes',
          'parentname': 'parent_name',
          'parentemail': 'parent_email',
          'parentphone': 'parent_phone',
          'emergencycontact': 'emergency_contact_name',
          'emergencyname': 'emergency_contact_name',
          'emergencyphone': 'emergency_contact_phone',
          'emergencyrelationship': 'emergency_contact_relationship',
          'bloodtype': 'blood_type',
          'allergies': 'allergies',
          'medications': 'medications',
          'doctorname': 'doctor_name',
          'doctor': 'doctor_name'
        };

        const systemField = fieldMap[lowerHeader] || 'ignore';
        return { csvColumn: header, systemField };
      });

      setImportState({
        ...importState,
        step: 'mapping',
        fileName: file.name,
        fileData: result.data,
        headers: result.headers,
        mappings: autoMappings
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to parse file', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingUpdate = (mappings: ColumnMapping[]) => {
    setImportState({ ...importState, mappings });
  };

  const handleMappingComplete = () => {
    const { validData, errors } = validateImportData(
      importState.fileData,
      importState.mappings
    );

    if (validData.length === 0) {
      showToast('No valid data found. Please check your mappings.', 'error');
      return;
    }

    setImportState({
      ...importState,
      step: 'preview',
      validatedData: validData,
      errors: errors
    });
  };

  const handleImport = async () => {
    setImportState({ ...importState, step: 'importing' });
    setIsProcessing(true);

    const totalRows = importState.validatedData.length;
    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    // Import in batches to avoid overwhelming the server
    const batchSize = 50;
    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = importState.validatedData.slice(i, i + batchSize);
      
      for (const studentData of batch) {
        try {
          await StudentService.createStudent(studentData as any);
          successCount++;
        } catch (error: any) {
          failCount++;
          errors.push({
            row: i + 2,
            message: error.message || 'Failed to import student',
            data: studentData
          });
        }
      }
    }

    setImportState({
      ...importState,
      step: 'complete',
      result: {
        success: failCount === 0,
        totalRows,
        successfulRows: successCount,
        failedRows: failCount,
        errors
      }
    });

    setIsProcessing(false);

    if (successCount > 0) {
      onSuccess();
    }
  };

  const handleReset = () => {
    setImportState({
      step: 'upload',
      fileName: '',
      fileData: [],
      headers: [],
      mappings: [],
      validatedData: [],
      errors: []
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderStepContent = () => {
    switch (importState.step) {
      case 'upload':
        return (
          <FileUploader
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />
        );
      
      case 'mapping':
        return (
          <ColumnMapper
            headers={importState.headers}
            mappings={importState.mappings}
            onMappingUpdate={handleMappingUpdate}
            sampleData={importState.fileData.slice(0, 3)}
          />
        );
      
      case 'preview':
        return (
          <ImportPreview
            data={importState.validatedData}
            errors={importState.errors}
            terminology={terminology}
          />
        );
      
      case 'importing':
        return (
          <ImportProgress
            total={importState.validatedData.length}
            current={0} // You could track this with a ref or state
          />
        );
      
      case 'complete':
        return (
          <ImportResults
            result={importState.result!}
            onNewImport={handleReset}
            terminology={terminology}
          />
        );
    }
  };

  const canProceed = () => {
    switch (importState.step) {
      case 'upload':
        return false; // File selection handled by component
      case 'mapping':
        // Check if required fields are mapped
        const mappedFields = importState.mappings
          .filter(m => m.systemField !== 'ignore')
          .map(m => m.systemField);
        return mappedFields.includes('first_name') && mappedFields.includes('last_name');
      case 'preview':
        return importState.validatedData.length > 0;
      default:
        return false;
    }
  };

  const getStepNumber = () => {
    const steps: ImportStep[] = ['upload', 'mapping', 'preview', 'importing', 'complete'];
    return steps.indexOf(importState.step) + 1;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Bulk Import ${terminology.students}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between px-6">
          {['Upload', 'Map Columns', 'Preview', 'Import', 'Complete'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${getStepNumber() > index + 1 
                  ? 'bg-green-500 text-white' 
                  : getStepNumber() === index + 1
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                {getStepNumber() > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                getStepNumber() === index + 1 
                  ? 'text-gray-900 dark:text-white font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {label}
              </span>
              {index < 4 && (
                <div className={`w-8 h-0.5 ml-2 ${
                  getStepNumber() > index + 1 
                    ? 'bg-green-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="px-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={importState.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {importState.step !== 'importing' && importState.step !== 'complete' && (
          <div className="px-6 pb-6 flex justify-between">
            <button
              type="button"
              onClick={importState.step === 'upload' ? handleClose : handleReset}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              <span>{importState.step === 'upload' ? 'Cancel' : 'Start Over'}</span>
            </button>

            {importState.step === 'mapping' && (
              <button
                type="button"
                onClick={handleMappingComplete}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>Continue to Preview</span>
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>
            )}

            {importState.step === 'preview' && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>Import {importState.validatedData.length} {terminology.students}</span>
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}