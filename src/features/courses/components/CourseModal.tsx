import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { CoursesService } from '../services/coursesService';
import type { SchoolCourse, CourseFormData } from '../services/coursesService';
import { CustomSelect } from '../../../components/CustomSelect';
import { CustomCheckbox } from '../../../components/CustomCheckbox';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  course?: SchoolCourse | null;
  categories: string[];
  levels: string[];
}

export function CourseModal({ isOpen, onClose, onSave, course, categories, levels }: CourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    category: '',
    level: '',
    duration_hours: undefined,
    max_capacity: undefined,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewLevelInput, setShowNewLevelInput] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description || '',
        category: course.category || '',
        level: course.level || '',
        duration_hours: course.duration_hours || undefined,
        max_capacity: course.max_capacity || undefined,
        is_active: course.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        level: '',
        duration_hours: undefined,
        max_capacity: undefined,
        is_active: true
      });
    }
    setNewCategory('');
    setNewLevel('');
    setShowNewCategoryInput(false);
    setShowNewLevelInput(false);
  }, [course, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('Course name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      
      // Use new category/level if provided
      const finalFormData = {
        ...formData,
        category: newCategory.trim() || formData.category,
        level: newLevel.trim() || formData.level
      };

      if (course) {
        await CoursesService.updateCourse(course.id, finalFormData);
        showToast('Course updated successfully', 'success');
      } else {
        await CoursesService.addCourse(finalFormData);
        showToast('Course added successfully', 'success');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving course:', error);
      showToast('Failed to save course', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    ...categories.map(cat => ({ 
      value: cat, 
      label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ') 
    })),
    { value: '__new__', label: '+ Add New Category' }
  ];

  const levelOptions = [
    { value: '', label: 'Select Level' },
    ...levels.map(level => ({ value: level, label: level })),
    { value: '__new__', label: '+ Add New Level' }
  ];

  const handleCategoryChange = (value: string) => {
    if (value === '__new__') {
      setShowNewCategoryInput(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowNewCategoryInput(false);
      setNewCategory('');
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleLevelChange = (value: string) => {
    if (value === '__new__') {
      setShowNewLevelInput(true);
      setFormData(prev => ({ ...prev, level: '' }));
    } else {
      setShowNewLevelInput(false);
      setNewLevel('');
      setFormData(prev => ({ ...prev, level: value }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Advanced Mathematics, Piano Lessons"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of what this course covers..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  {showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new category name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategory('');
                        }}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      value={formData.category}
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      placeholder="Select or add category"
                    />
                  )}
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Level
                  </label>
                  {showNewLevelInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new level name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewLevelInput(false);
                          setNewLevel('');
                        }}
                        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      value={formData.level}
                      onChange={handleLevelChange}
                      options={levelOptions}
                      placeholder="Select or add level"
                    />
                  )}
                </div>

                {/* Duration and Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.duration_hours || ''}
                      onChange={(e) => handleInputChange('duration_hours', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_capacity || ''}
                      onChange={(e) => handleInputChange('max_capacity', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <CustomCheckbox
                    checked={formData.is_active || false}
                    onChange={(checked) => handleInputChange('is_active', checked)}
                    label="Course is active and available for enrollment"
                    description="Inactive courses won't appear in enrollment options"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}