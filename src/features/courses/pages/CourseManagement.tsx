import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { CoursesService } from '../services/coursesService';
import type { SchoolCourse, CourseFilters } from '../services/coursesService';
import { CustomSelect } from '../../../components/CustomSelect';
import { CourseModal } from '../components/CourseModal';

export function CourseManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<SchoolCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<SchoolCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<SchoolCourse | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<CourseFilters>({
    category: '',
    level: '',
    is_active: undefined,
    search: ''
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadCourses();
    loadFilterOptions();
    
    // Check if we should open the add modal from URL parameter
    if (searchParams.get('action') === 'add') {
      setShowModal(true);
      setEditingCourse(null);
      // Clear the URL parameter
      setSearchParams({});
    }

    // Listen for custom event from sidebar
    const handleOpenAddModal = () => {
      setShowModal(true);
      setEditingCourse(null);
    };

    window.addEventListener('openAddCourseModal', handleOpenAddModal);
    
    return () => {
      window.removeEventListener('openAddCourseModal', handleOpenAddModal);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await CoursesService.getAllSchoolCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, levelsData] = await Promise.all([
        CoursesService.getCourseCategories(),
        CoursesService.getCourseLevels()
      ]);
      setCategories(categoriesData);
      setLevels(levelsData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }
    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }
    if (filters.is_active !== undefined) {
      filtered = filtered.filter(course => course.is_active === filters.is_active);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course: SchoolCourse) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDeleteCourse = async (course: SchoolCourse) => {
    if (!confirm(`Are you sure you want to delete "${course.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await CoursesService.deleteCourse(course.id);
      showToast('Course deleted successfully', 'success');
      loadCourses();
      loadFilterOptions(); // Refresh filter options
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast('Failed to delete course', 'error');
    }
  };

  const handleToggleStatus = async (course: SchoolCourse) => {
    try {
      await CoursesService.toggleCourseStatus(course.id);
      showToast(`Course ${course.is_active ? 'deactivated' : 'activated'} successfully`, 'success');
      loadCourses();
    } catch (error) {
      console.error('Error toggling course status:', error);
      showToast('Failed to update course status', 'error');
    }
  };

  const handleImportDefaults = async () => {
    if (!confirm('This will import default courses for your institution type. Continue?')) {
      return;
    }

    try {
      setImporting(true);
      const result = await CoursesService.importDefaultCourses();
      
      if (result.success > 0) {
        showToast(`Successfully imported ${result.success} courses`, 'success');
        loadCourses();
        loadFilterOptions();
      }
      
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
        showToast(`Imported with ${result.errors.length} errors. Check console for details.`, 'warning');
      }
    } catch (error) {
      console.error('Error importing courses:', error);
      showToast('Failed to import default courses', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingCourse(null);
    loadCourses();
    loadFilterOptions(); // Refresh filter options
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      is_active: undefined,
      search: ''
    });
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ') }))
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    ...levels.map(level => ({ value: level, label: level }))
  ];

  const statusOptions = [
    { value: '', label: 'All Courses' },
    { value: 'true', label: 'Active Only' },
    { value: 'false', label: 'Inactive Only' }
  ];

  const activeCount = courses.filter(c => c.is_active).length;
  const inactiveCount = courses.filter(c => !c.is_active).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Course Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your institution's course catalog
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={handleImportDefaults}
            disabled={importing}
            className="px-4 py-2 border border-orange-300 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import Defaults'}
          </button>
          <button
            onClick={handleAddCourse}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Total Courses</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Active</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{inactiveCount}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Inactive</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{categories.length}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Categories</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-auto">
            <CustomSelect
              value={filters.category}
              onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              options={categoryOptions}
              placeholder="Category"
            />
            <CustomSelect
              value={filters.level}
              onChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
              options={levelOptions}
              placeholder="Level"
            />
            <CustomSelect
              value={filters.is_active?.toString() || ''}
              onChange={(value) => setFilters(prev => ({ 
                ...prev, 
                is_active: value === '' ? undefined : value === 'true'
              }))}
              options={statusOptions}
              placeholder="Status"
            />
          </div>
          {(filters.search || filters.category || filters.level || filters.is_active !== undefined) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading courses...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {courses.length === 0 ? 'No courses yet' : 'No courses found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {courses.length === 0 
              ? 'Start by adding your first course or importing defaults'
              : 'Try adjusting your filters or search terms'
            }
          </p>
          {courses.length === 0 && (
            <div className="flex justify-center gap-3">
              <button
                onClick={handleImportDefaults}
                disabled={importing}
                className="px-4 py-2 border border-orange-300 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                Import Defaults
              </button>
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Course
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleEditCourse(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.is_active 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {course.category && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Category:</span>
                      <span className="ml-1 capitalize">{course.category.replace('_', ' ')}</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Level:</span>
                      <span className="ml-1">{course.level}</span>
                    </div>
                  )}
                  {course.duration_hours && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">{course.duration_hours}h</span>
                    </div>
                  )}
                  {course.max_capacity && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Capacity:</span>
                      <span className="ml-1">{course.max_capacity} students</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCourse(course);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(course);
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        course.is_active
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      }`}
                    >
                      {course.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course);
                    }}
                    className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCourse(null);
        }}
        onSave={handleModalSave}
        course={editingCourse}
        categories={categories}
        levels={levels}
      />
    </div>
  );
}